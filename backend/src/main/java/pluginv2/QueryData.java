package pluginv2;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.channels.Channels;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import org.apache.arrow.adapter.jdbc.ArrowVectorIterator;
import org.apache.arrow.adapter.jdbc.JdbcToArrow;
import org.apache.arrow.adapter.jdbc.JdbcToArrowConfig;
import org.apache.arrow.memory.BufferAllocator;
import org.apache.arrow.memory.RootAllocator;
import org.apache.arrow.vector.VectorSchemaRoot;
import org.apache.arrow.vector.ipc.ArrowFileWriter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.google.protobuf.ByteString;
import com.grafana.backend.DataGrpc.DataImplBase;
import com.grafana.backend.DataQuery;
import com.grafana.backend.DataResponse;
import com.grafana.backend.DataSourceInstanceSettings;
import com.grafana.backend.QueryDataRequest;
import com.grafana.backend.QueryDataResponse;

import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;
import pluginv2.converters.JDBCConfig;
import pluginv2.query.Query;

@GrpcService
public class QueryData extends DataImplBase {

	private static final Logger logger = LoggerFactory.getLogger(QueryData.class);

	@Autowired
	private Datasource datasource;

	@Override
	public void queryData(QueryDataRequest request, StreamObserver<QueryDataResponse> responseObserver) {
		QueryDataResponse.Builder builder = QueryDataResponse.newBuilder();
		DataSourceInstanceSettings settings = request.getPluginContext().getDataSourceInstanceSettings();

		try {
			Connection conn = datasource.connect(settings);
			try {
				request.getQueriesList().forEach(query -> {
					DataResponse.Builder respBuilder = DataResponse.newBuilder();
					try {
						ByteString frame = runQuery(conn, query);
						respBuilder.addFrames(frame);
					} catch (IOException | SQLException e) {
						e.printStackTrace();
						respBuilder.setError(e.getMessage());
					}
					DataResponse response = respBuilder.build();
					builder.putResponses(query.getRefId(), response);
				});
			} catch (Exception e) {
				throw e;
			} finally {
				try {
					conn.close();
				} catch (SQLException e) {
					e.printStackTrace();
				}
			}
	
			QueryDataResponse response = builder.build();
			responseObserver.onNext(response);
			responseObserver.onCompleted();

		} catch (JsonProcessingException | SQLException e) {
			DataResponse.Builder respBuilder = DataResponse.newBuilder();
			respBuilder.setError(e.getMessage());
			DataResponse resp = respBuilder.build();
			builder.putResponses("error", resp);
			QueryDataResponse response = builder.build();
			responseObserver.onNext(response);
			responseObserver.onCompleted();
		}
	}

	private ByteString runQuery(Connection connection, DataQuery query) throws JsonProcessingException, SQLException, IOException {
		Query q = Query.Load(query.getJson());
		logger.info("Running query: " + q.getRawSql());

		ByteString frame = null;
		try (BufferAllocator allocator = new RootAllocator()) {

			PreparedStatement statement = connection.prepareStatement(q.getRawSql());
			ResultSet resultSet = statement.executeQuery();
			JdbcToArrowConfig config = JDBCConfig.getConfig(allocator);
			frame = toDataFrame(config, resultSet);
			resultSet.close();
			return frame;

		} catch (IllegalStateException e) {
			e.printStackTrace();
			// throw e;
		}
		return frame;
	}

	private ByteString toDataFrame(JdbcToArrowConfig config, ResultSet resultSet) throws IOException, SQLException {
		ByteArrayOutputStream out = new ByteArrayOutputStream();
		try (
			ArrowVectorIterator iterator = JdbcToArrow.sqlToArrowVectorIterator(resultSet, config)) {
			
			if (!iterator.hasNext()) {
				// TODO: probably don't need to throw error here
				throw new IllegalStateException("The ArrowVectorIterator has no data!");
			}

			// Write schema and batches to file
			VectorSchemaRoot root = iterator.next();

			try (ArrowFileWriter writer = new ArrowFileWriter(root, null, Channels.newChannel(out))) {
				writer.start();

				// Write the first batch
				writer.writeBatch();

				logger.info("Arrow Schema: \n" + root.getSchema());

				String content = root.contentToTSVString();
				logger.info("Arrow content: \n" + content);

				// Write the remaining batches
				while (iterator.hasNext()) {
					try {
						iterator.next();
						writer.writeBatch();
					} catch (IOException e) {
						logger.error(e.getMessage());
						e.printStackTrace();
						break;
					}

				}

				// Finalize the file
				writer.end();
			} finally {
				root.close();
			}

			return ByteString.copyFrom(out.toByteArray());
		} finally {
			out.close();
		}
	}
}

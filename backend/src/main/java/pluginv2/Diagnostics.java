package pluginv2;

import java.sql.Connection;
import java.sql.SQLException;

import org.springframework.beans.factory.annotation.Autowired;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.grafana.backend.CheckHealthRequest;
import com.grafana.backend.CheckHealthResponse;
import com.grafana.backend.CheckHealthResponse.HealthStatus;
import com.grafana.backend.DataSourceInstanceSettings;
import com.grafana.backend.DiagnosticsGrpc.DiagnosticsImplBase;

import net.devh.boot.grpc.server.service.GrpcService;

@GrpcService
public class Diagnostics extends DiagnosticsImplBase {

    @Autowired
    private Datasource datasource;

    @Override
    public void checkHealth(CheckHealthRequest request,
        io.grpc.stub.StreamObserver<CheckHealthResponse> responseObserver) {

        CheckHealthResponse.Builder builder = CheckHealthResponse.newBuilder();

        DataSourceInstanceSettings settings = request.getPluginContext().getDataSourceInstanceSettings();
        try {
            Connection conn = datasource.connect(settings);
            conn.close();
            builder.setStatus(HealthStatus.OK).setMessage("OK");
        } catch (JsonProcessingException ex) {
            builder.setStatus(HealthStatus.ERROR).setMessage(ex.getMessage());
        } catch (SQLException ex) {
            builder.setStatus(HealthStatus.ERROR).setMessage(ex.getMessage());
        }

		CheckHealthResponse response = builder.build();
		responseObserver.onNext(response);
		responseObserver.onCompleted();
    }
}

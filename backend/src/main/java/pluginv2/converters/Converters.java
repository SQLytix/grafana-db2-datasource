package pluginv2.converters;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.apache.arrow.adapter.jdbc.JdbcToArrowConfig;
import org.apache.arrow.adapter.jdbc.JdbcToArrowConfig.JdbcConsumerFactory;
import org.apache.arrow.adapter.jdbc.JdbcToArrowUtils;
import org.apache.arrow.adapter.jdbc.consumer.JdbcConsumer;
import org.apache.arrow.vector.FieldVector;
import org.apache.arrow.vector.TimeStampVector;
import org.apache.arrow.vector.types.DateUnit;
import org.apache.arrow.vector.types.TimeUnit;
import org.apache.arrow.vector.types.pojo.ArrowType;

public class Converters {
    /**
	 * Custom JdbcConsumerFactory implementation to handle TIMESTAMP columns with custom logic.
	 * Grafana expects timestamps in nanoseconds, but the default implementation uses milliseconds.
     */
    public static class CustomJdbcConsumerFactory implements JdbcConsumerFactory {

        // Registry that maps ArrowType to JdbcConsumerFactory
        private static final Map<ArrowType, JdbcConsumerFactory> consumerFactoryMap = new HashMap<>();

        static {
			// Register consumers for different ArrowType
			consumerFactoryMap.put(
                new ArrowType.Timestamp(TimeUnit.MILLISECOND, null), 
				(arrowType, columnIndex, nullable, vector, config) ->
					new TimestampJdbcConsumer(columnIndex, (TimeStampVector) vector)
            );

            consumerFactoryMap.put(
                new ArrowType.Date(DateUnit.DAY), 
				(arrowType, columnIndex, nullable, vector, config) ->
					new DateJdbcConsumer(columnIndex, (TimeStampVector) vector)
            );

            // You can add more ArrowType mappings here if needed
            // consumerFactoryMap.put(new ArrowType.Int(32, true), (columnIndex, nullable, vector, config) -> new IntJdbcConsumer(columnIndex, (IntVector) vector));
        }

        @Override
        public JdbcConsumer<?> apply(
                ArrowType arrowType,
                int columnIndex,
                boolean nullable,
                FieldVector vector,
                JdbcToArrowConfig config) {

            // Look up the consumer factory for the given ArrowType in the registry
            JdbcConsumerFactory consumerFactory = consumerFactoryMap.get(arrowType);

            if (consumerFactory != null) {
                return consumerFactory.apply(arrowType, columnIndex, nullable, vector, config);
            }

            // Fallback: Use the default consumer for unsupported types
            return JdbcToArrowUtils.getConsumer(arrowType, columnIndex, nullable, vector, config);
        }
    }

    /**
     * Timestamp-specific JdbcConsumer.
     */
    static class TimestampJdbcConsumer implements JdbcConsumer<TimeStampVector> {

        private final int columnIndex;
        private final TimeStampVector timeStampVector;

        public TimestampJdbcConsumer(int columnIndex, TimeStampVector timeStampVector) {
            this.columnIndex = columnIndex;
            this.timeStampVector = timeStampVector;
        }

        @Override
        public void consume(ResultSet resultSet) throws SQLException {
            Timestamp timestamp = resultSet.getTimestamp(columnIndex);
            if (timestamp != null) {
                // Convert milliseconds to nanoseconds
                long nanoseconds = timestamp.getTime() * 1_000_000L + timestamp.getNanos() % 1_000_000L;

                // Set the value at the current value count position
                int currentIndex = timeStampVector.getValueCount();
                timeStampVector.setSafe(currentIndex, nanoseconds);

                // Increment the value count to reflect the new value added
                timeStampVector.setValueCount(currentIndex + 1);
            } else {
                timeStampVector.setNull(timeStampVector.getValueCount());
            }
        }

        @Override
        public void resetValueVector(TimeStampVector vector) {
            timeStampVector.clear();
        }

        @Override
        public void close() {
            timeStampVector.close();
        }
    }

    /**
     * Date-specific JdbcConsumer.
     */
    static class DateJdbcConsumer implements JdbcConsumer<TimeStampVector> {

        private final int columnIndex;
        private final TimeStampVector vector;

        public DateJdbcConsumer(int columnIndex, TimeStampVector dateDayVector) {
            this.columnIndex = columnIndex;
            this.vector = dateDayVector;
        }

        @Override
        public void consume(ResultSet resultSet) throws SQLException {
            Instant instant = null;
            try {
                Date date = resultSet.getDate(columnIndex);
                instant = date.toInstant();
            } catch (SQLException e) {
                System.out.print("Error: " + e);
            }
 
            if (instant != null) {
                // Convert milliseconds to nanoseconds
                long nanoseconds = instant.getNano();

                // Set the value at the current value count position
                int currentIndex = vector.getValueCount();
                vector.setSafe(currentIndex, nanoseconds);

                // Increment the value count to reflect the new value added
                vector.setValueCount(currentIndex + 1);
            } else {
                vector.setNull(vector.getValueCount());
            }
        }

        @Override
        public void resetValueVector(TimeStampVector vector) {
            vector.clear();
        }

        @Override
        public void close() {
            vector.close();
        }
    }
}


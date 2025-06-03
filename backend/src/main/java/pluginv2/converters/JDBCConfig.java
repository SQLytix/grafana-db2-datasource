package pluginv2.converters;

import java.sql.Types;

import org.apache.arrow.adapter.jdbc.JdbcToArrowConfig;
import org.apache.arrow.adapter.jdbc.JdbcToArrowConfigBuilder;
import org.apache.arrow.adapter.jdbc.JdbcToArrowUtils;
import org.apache.arrow.memory.BufferAllocator;
import org.apache.arrow.vector.types.FloatingPointPrecision;
import org.apache.arrow.vector.types.TimeUnit;
import org.apache.arrow.vector.types.pojo.ArrowType;

public class JDBCConfig {
    public static JdbcToArrowConfig getConfig(BufferAllocator allocator) {
        JdbcToArrowConfig config = new JdbcToArrowConfigBuilder(allocator, /* calendar= */null)
                .setReuseVectorSchemaRoot(true)
                .setJdbcConsumerGetter(new Converters.CustomJdbcConsumerFactory())
                .setJdbcToArrowTypeConverter((jdbcFieldInfo -> {
                    switch (jdbcFieldInfo.getJdbcType()) {
                        // Convert DATE to TIMESTAMP - Grafana does not support DATE type
                        case Types.DATE:
                            return new ArrowType.Timestamp(TimeUnit.MILLISECOND, null);
                        // Convert DECIMAL to Float - Grafana does not support DECIMAL type
                        case Types.DECIMAL:
                            return new ArrowType.FloatingPoint(FloatingPointPrecision.DOUBLE);
                        case Types.TIME:
                            // TODO: not sure what we want to convert TIME to - string for now
                            return new ArrowType.Utf8();
                        default:
                            return JdbcToArrowUtils.getArrowTypeFromJdbcType(jdbcFieldInfo, null);
                    }
                }))
                .build();
        return config;
    }
}

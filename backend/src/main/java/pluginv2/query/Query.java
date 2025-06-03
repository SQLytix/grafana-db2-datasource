package pluginv2.query;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.protobuf.ByteString;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Query {
    private Datasource datasource;
    private String datasourceId;
    private String rawSql;
    private String format;
    private String intervalMs;
    private String maxDataPoints;
    private String refId;

    public static Query Load(ByteString json) throws JsonProcessingException {
        ObjectMapper mapper = new ObjectMapper();
        // ObjectMapper mapper = new ObjectMapper().configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        String jsonString = json.toStringUtf8(); 
        Query settings = mapper.readValue(jsonString, Query.class);
        return settings;
    }
}

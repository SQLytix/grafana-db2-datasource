package pluginv2;

import java.sql.SQLException;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.google.protobuf.ByteString;
import com.grafana.backend.DataSourceInstanceSettings;

import pluginv2.jdbc.Connection;
import pluginv2.jdbc.Connector;
import settings.Setting;
import settings.Settings;

@Service()
public class Datasource {

    @Autowired
    private Connector connector;

    public java.sql.Connection connect(DataSourceInstanceSettings settings) throws JsonProcessingException, SQLException {
        ByteString json = settings.getJsonData();
        Map<String, String> decrypted = settings.getDecryptedSecureJsonDataMap();
        System.out.println("Connecting to data source");

        Settings connectionSettings = Settings.Load(json);
        Connection conn = getConnection(connectionSettings, decrypted);
        return connector.connect(conn);
    }

    private Connection getConnection(Settings settings, Map<String, String> decrypted) {
        Connection conn = new Connection();

        Setting[] values = settings.getSettings();
        for (Setting setting : values) {
            String value = setting.getValue();
            if (setting.getSecure() != null && setting.getSecure()) {
                value = decrypted.get(setting.getName());
            }
            // typical JDBC connection settings
            switch (setting.getName()) {
                case "username":
                    conn.setUsername(value);
                    break;
                case "password":
                    conn.setPassword(value);
                    break;
                case "host":
                    conn.setHost(value);
                    break;
                 case "port":
                    conn.setPort(value);
                    break;
                case "database":
                    conn.setDatabase(value);
                    break;
                case "type":
                    conn.setType(value);
                    break;
            }
        }
        return conn;
    }
}

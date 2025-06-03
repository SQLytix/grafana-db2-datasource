package settings;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.protobuf.ByteString;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Settings {

  private Setting[] settings;

  public Settings() {

  }
  
  public static Settings Load(ByteString json) throws JsonProcessingException {
        ObjectMapper mapper = new ObjectMapper();
        String jsonString = json.toStringUtf8(); 
        Settings settings = mapper.readValue(jsonString, Settings.class);
        return settings;
  }  
}


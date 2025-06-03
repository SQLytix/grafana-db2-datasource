package settings;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Setting {
    private String Name;
    private String Value;
    private Boolean Secure;
}

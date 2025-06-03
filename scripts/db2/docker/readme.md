## Running DB2 in docker
```
docker compose up
```

### Log into container and test it ( to confirm it's working)

```
docker exec -it db2Server sh
export DB2INSTANCE="DB2INST1"
export DB2_HOME="/opt/ibm/db2/v12.1"
export PATH="$PATH:$DB2_HOME/bin"
export PATH="$PATH:$DB2_HOME/adm"

source /home/db2inst1/sqllib/db2profile

su - db2inst1
db2sampl -force -sql -verbose

db2 connect to SAMPLE
db2 "select * from department"
```

### Test from DBeaver
#### Add a new driver to dbeaver > add artifact  ( this is the same driver we use )
```
    <dependency>
      <groupId>com.ibm.db2.jcc</groupId>
      <artifactId>db2jcc</artifactId>
      <version>db2jcc4</version>
    </dependency>
```
    * classname - com.ibm.db2.jcc.DB2Driver

#### Add connection
URL: jdbc:db2://localhost:50000/SAMPLE
Username: db2inst1
Password: db2pw


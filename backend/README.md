# DB2 Datasource Backend

A Java based Grafana Datasource Backend for DB2.  No runtime dependencies. The backend executable is built with GraalVM.

## Running in VS Code

### Install VSCode Extensions

* Extension Pack for Java
* Spring Initializr Java Support

### Build the Java Backend

After installing the extensions you will see a MAVEN option appear on the left nav accordion.

### Install

```
brew install maven
```

```
brew install openjdk
```

#### Build 

MAVEN > db2-datasource > Lifecycle > install

The jar will be built under the `target` folder.

This jar can be copied to the pkg folder of the db2-datasource.

#### Debug locally ( testing )
Use the vscode launch config:  `Spring Boot-App<db2-datasource>`

#### Run locally ( testing ) using MAVEN extension

MAVEN > db2-datasource > Plugins > spring-boot > run

You can use Postman etc to test the grpc calls.

Example: [Postman](https://db2-datasource.postman.co/workspace/db2-datasource~3828ec51-8c66-4349-9973-a15ffe8ec9b7/collection/6744d3e91b8ea0b69345acb2?action=share&creator=24818991)

You can also call/test this directly from the db2-datasource plugin.
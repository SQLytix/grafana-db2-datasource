package pluginv2;

import com.grafana.backend.AdmissionControlGrpc.AdmissionControlImplBase;
import com.grafana.backend.AdmissionRequest;
import com.grafana.backend.ValidationResponse;

import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;

@GrpcService
public class ValidateAdmission extends AdmissionControlImplBase {

    @Override
    public void validateAdmission(AdmissionRequest request,
    StreamObserver<ValidationResponse> responseObserver) {
        // TODO: not sure if we need this?  This is a placeholder for now
        ValidationResponse response = ValidationResponse.newBuilder()
            .setAllowed(true)
            .build();
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

}

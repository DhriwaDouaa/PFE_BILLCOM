package com.example.timesten.repository;

import com.example.timesten.model.CovoiturageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CovoiturageRepository extends JpaRepository<CovoiturageRequest, Long> {

    @Query(value = "SELECT * FROM TIMESTEN.COVOITURAGE_REQUESTS WHERE VEHICLE_ID = :vehicleId AND STATUS = 'PENDING' ORDER BY CREATED_AT DESC", nativeQuery = true)
    List<CovoiturageRequest> findPendingByVehicleId(@Param("vehicleId") Long vehicleId);

    @Query(value = "SELECT * FROM TIMESTEN.COVOITURAGE_REQUESTS WHERE VEHICLE_ID = :vehicleId AND STATUS = 'ACCEPTED'", nativeQuery = true)
    List<CovoiturageRequest> findAcceptedByVehicleId(@Param("vehicleId") Long vehicleId);

    List<CovoiturageRequest> findByCustId(Long custId);
}

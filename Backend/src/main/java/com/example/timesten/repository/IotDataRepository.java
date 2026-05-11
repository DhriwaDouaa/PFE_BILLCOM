package com.example.timesten.repository;
import com.example.timesten.model.IotData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface IotDataRepository extends JpaRepository<IotData, Long> {
    List<IotData> findByCustId(Long custId);

    @Query(value = "SELECT * FROM TIMESTEN.IOT_DATA WHERE CUST_ID = :custId AND ROWNUM = 1 ORDER BY RECEIVED_AT DESC", nativeQuery = true)
    Optional<IotData> findTopByCustIdOrderByReceivedAtDesc(@Param("custId") Long custId);
}

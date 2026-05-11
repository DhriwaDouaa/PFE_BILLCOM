package com.example.timesten.repository;

import com.example.timesten.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    // Recherche par statut
    List<Customer> findByStatus(String status);

    // Recherche par nom (insensible à la casse)
    List<Customer> findByNameIgnoreCase(String name);

    // Clients avec solde supérieur à un montant
    List<Customer> findByBalanceGreaterThan(BigDecimal balance);

    // Requête JPQL personnalisée
    @Query("SELECT c FROM Customer c WHERE c.status = :status AND c.balance >= :minBalance")
    List<Customer> findActiveCustomersWithMinBalance(
            @Param("status") String status,
            @Param("minBalance") BigDecimal minBalance);

    // Requête SQL native (utile pour features TimesTen spécifiques)
    @Query(value = "SELECT * FROM TIMESTEN.CUSTOMERS WHERE ROWNUM <= :limit", nativeQuery = true)
    List<Customer> findTopCustomers(@Param("limit") int limit);

    // Mise à jour du statut
    @Modifying
    @Query("UPDATE Customer c SET c.status = :status WHERE c.custId = :id")
    int updateStatus(@Param("id") Long id, @Param("status") String status);

    // Vérifier si un client existe par nom
    boolean existsByNameIgnoreCase(String name);
}

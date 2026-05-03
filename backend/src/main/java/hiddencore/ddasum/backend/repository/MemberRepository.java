package hiddencore.ddasum.backend.repository;


import hiddencore.ddasum.backend.domain.Users;
import hiddencore.ddasum.backend.domain.Users.UsersRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository 

public interface MemberRepository extends JpaRepository<Users, Long> {

    Optional<Users> findByUserId(Long userId);

    Optional<Users> findByLoginId(String loginId);

    Optional<Users> findByEmail(String email);

    Optional<Users> findByPhone(String phone);

    boolean existsByLoginId(String loginId);

    boolean existsByName(String name);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    Optional<Users> findByFacilityId_FacilityIdAndEmployeeLoginId(Long facilityId, String employeeLoginId);

    Optional<Users> findByLoginIdAndRole(String loginId, UsersRole role);

    @Query(
            "select coalesce(max(cast(substring(u.employeeLoginId, 9, 2) as integer)), 0) from Users u "
                    + "where u.facilityId.facilityId = :facilityId and substring(u.employeeLoginId, 1, 8) = :prefix "
                    + "and length(u.employeeLoginId) = 10")
    int findMaxEmployeeSequenceSuffix(@Param("facilityId") Long facilityId, @Param("prefix") String prefix);
}

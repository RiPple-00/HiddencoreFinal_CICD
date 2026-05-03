package hiddencore.ddasum.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import hiddencore.ddasum.backend.domain.Users;
import hiddencore.ddasum.backend.domain.Users.UsersRole;

public interface GuardianRepository extends JpaRepository<Users, Long> {

    // userId로 사용자 조회
    Optional<Users> findByUserId(Long userId);

    // userId + role로 보호자인지 확인
    Optional<Users> findByUserIdAndRole(Long userId, UsersRole role);

    // 보호자 목록 조회
    List<Users> findByRole(UsersRole role);
}
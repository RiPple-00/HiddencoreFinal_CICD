package hiddencore.ddasum.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import hiddencore.ddasum.backend.domain.Users;

@Repository
public interface UsersRepository extends JpaRepository<Users, Long> {}

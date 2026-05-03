package hiddencore.ddasum.backend.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import hiddencore.ddasum.backend.domain.Schedule;
import hiddencore.ddasum.backend.domain.Schedule.ScheduleType;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    List<Schedule> findByFacilityId_FacilityIdAndScheduledAtBetween(
            Long facilityId,
            LocalDateTime start,
            LocalDateTime end);

    List<Schedule> findByFacilityId_FacilityIdAndTypeAndScheduledAtBetween(
            Long facilityId,
            ScheduleType type,
            LocalDateTime start,
            LocalDateTime end);
}

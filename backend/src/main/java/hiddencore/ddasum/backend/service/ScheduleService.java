package hiddencore.ddasum.backend.service;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.List;
import hiddencore.ddasum.backend.domain.Schedule;
import hiddencore.ddasum.backend.domain.Schedule.ScheduleType;
import hiddencore.ddasum.backend.domain.Facility;
import hiddencore.ddasum.backend.domain.Patient;
import hiddencore.ddasum.backend.domain.Users;
import hiddencore.ddasum.backend.repository.FacilityRepository;
import hiddencore.ddasum.backend.repository.PatientRepository;
import hiddencore.ddasum.backend.repository.ScheduleRepository;
import hiddencore.ddasum.backend.repository.UsersRepository;
import hiddencore.ddasum.backend.web.dto.ScheduleResponse;
import hiddencore.ddasum.backend.web.dto.ScheduleCreateRequest;
import hiddencore.ddasum.backend.web.dto.ScheduleUpdateRequest;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final FacilityRepository facilityRepository;
    private final UsersRepository usersRepository;
    private final PatientRepository patientRepository;

    private LocalDateTime startOfMonth(LocalDateTime date) {
        YearMonth ym = YearMonth.of(date.getYear(), date.getMonth());
        return ym.atDay(1).atStartOfDay();
    }

    private LocalDateTime endOfMonth(LocalDateTime date) {
        YearMonth ym = YearMonth.of(date.getYear(), date.getMonth());
        return ym.atEndOfMonth().atTime(LocalTime.MAX);
    }

    private Long resolveFacilityId(Long facilityId) {
        if (facilityId != null && facilityRepository.existsById(facilityId)) {
            return facilityId;
        }
        return facilityRepository.findAll().stream()
                .findFirst()
                .map(Facility::getFacilityId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "facilityId is required"));
    }

    // 월별 달력 일정 조회
    public List<ScheduleResponse> getSchedulesByMonth(Long facilityId, LocalDateTime referenceDate) {
        Long resolvedFacilityId = resolveFacilityId(facilityId);
        LocalDateTime start = startOfMonth(referenceDate);
        LocalDateTime end = endOfMonth(referenceDate);
        List<Schedule> schedules = scheduleRepository.findByFacilityId_FacilityIdAndScheduledAtBetween(
                resolvedFacilityId,
                start,
                end);
        return schedules.stream()
                .map(schedule -> ScheduleResponse.builder()
                        .scheduleId(schedule.getScheduleId())
                        .facilityId(schedule.getFacilityId().getFacilityId())
                        .createdUserId(schedule.getCreatedUserId().getUserId())
                        .patientId(schedule.getPatientId() != null ? schedule.getPatientId().getPatientId() : null)
                        .title(schedule.getTitle())
                        .content(schedule.getContent())
                        .type(schedule.getType())
                        .scheduledAt(schedule.getScheduledAt())
                        .endAt(schedule.getEndAt())
                        .build())
                .collect(Collectors.toList());
    }

    // 필터링 조회
    public List<ScheduleResponse> getSchedulesByTypeAndMonth(Long facilityId, ScheduleType type,
            LocalDateTime referenceDate) {
        Long resolvedFacilityId = resolveFacilityId(facilityId);
        LocalDateTime start = startOfMonth(referenceDate);
        LocalDateTime end = endOfMonth(referenceDate);
        List<Schedule> schedules = scheduleRepository.findByFacilityId_FacilityIdAndTypeAndScheduledAtBetween(
                resolvedFacilityId,
                type,
                start,
                end);
        return schedules.stream()
                .map(schedule -> ScheduleResponse.builder()
                        .scheduleId(schedule.getScheduleId())
                        .facilityId(schedule.getFacilityId().getFacilityId())
                        .createdUserId(schedule.getCreatedUserId().getUserId())
                        .patientId(schedule.getPatientId() != null ? schedule.getPatientId().getPatientId() : null)
                        .title(schedule.getTitle())
                        .content(schedule.getContent())
                        .type(schedule.getType())
                        .scheduledAt(schedule.getScheduledAt())
                        .endAt(schedule.getEndAt())
                        .build())
                .collect(Collectors.toList());
    }

    // 오늘 일정 조회
    public List<ScheduleResponse> getSchedulesForToday(Long facilityId) {
        Long resolvedFacilityId = resolveFacilityId(facilityId);
        LocalDateTime start = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime end = start.plusDays(1);
        List<Schedule> schedules = scheduleRepository.findByFacilityId_FacilityIdAndScheduledAtBetween(
                resolvedFacilityId,
                start,
                end);
        return schedules.stream()
                .map(ScheduleResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // 개인 일정 등록
    @Transactional
    public ScheduleResponse createPersonalSchedule(ScheduleCreateRequest request) {
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title is required");
        }
        if (request.getScheduledAt() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "scheduledAt is required");
        }

        Users createdUser = null;
        if (request.getCreatedUserId() != null) {
            createdUser = usersRepository.findById(request.getCreatedUserId()).orElse(null);
        } else {
            createdUser = usersRepository.findAll().stream().findFirst()
                    .orElseThrow(
                            () -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "createdUserId is required"));
        }
        if (createdUser == null) {
            createdUser = usersRepository.findAll().stream().findFirst()
                    .orElseThrow(
                            () -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "createdUserId is required"));
        }

        Facility facility = null;
        if (request.getFacilityId() != null) {
            facility = facilityRepository.findById(request.getFacilityId()).orElse(null);
        } else if (createdUser.getFacilityId() != null) {
            facility = createdUser.getFacilityId();
        } else {
            facility = facilityRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "facilityId is required"));
        }
        if (facility == null) {
            facility = facilityRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "facilityId is required"));
        }
        Patient patient = null;
        if (request.getPatientId() != null) {
            patient = patientRepository.findById(request.getPatientId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found"));
        }

        Schedule schedule = Schedule.builder()
                .facilityId(facility)
                .createdUserId(createdUser)
                .patientId(patient)
                .title(request.getTitle())
                .content(request.getContent())
                .type(ScheduleType.PERSONAL)
                .scheduledAt(request.getScheduledAt())
                .endAt(request.getEndAt())
                .build();
        Schedule saved = scheduleRepository.save(schedule);
        return ScheduleResponse.fromEntity(saved);
    }

    // 프로그램 일정 조회
    public List<ScheduleResponse> getProgramSchedules(Long facilityId, LocalDateTime referenceDate) {
        return getSchedulesByTypeAndMonth(facilityId, ScheduleType.PROGRAM, referenceDate);
    }

    public ScheduleResponse getScheduleById(Long scheduleId) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Schedule not found"));
        return ScheduleResponse.fromEntity(schedule);
    }

    @Transactional
    public ScheduleResponse updatePersonalSchedule(Long scheduleId, ScheduleUpdateRequest request) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Schedule not found"));

        if (schedule.getType() != ScheduleType.PERSONAL) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PERSONAL schedule can be updated here");
        }

        if (request.getFacilityId() != null) {
            Facility facility = facilityRepository.findById(request.getFacilityId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Facility not found"));
            schedule.setFacilityId(facility);
        }

        if (request.getCreatedUserId() != null) {
            Users createdUser = usersRepository.findById(request.getCreatedUserId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
            schedule.setCreatedUserId(createdUser);
        }

        if (request.getPatientId() != null) {
            Patient patient = patientRepository.findById(request.getPatientId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found"));
            schedule.setPatientId(patient);
        }

        if (request.getTitle() != null)
            schedule.setTitle(request.getTitle());
        if (request.getContent() != null)
            schedule.setContent(request.getContent());
        if (request.getScheduledAt() != null)
            schedule.setScheduledAt(request.getScheduledAt());
        if (request.getEndAt() != null)
            schedule.setEndAt(request.getEndAt());

        Schedule saved = scheduleRepository.save(schedule);
        return ScheduleResponse.fromEntity(saved);
    }

    @Transactional
    public void deletePersonalSchedule(Long scheduleId) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Schedule not found"));

        if (schedule.getType() != ScheduleType.PERSONAL) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PERSONAL schedule can be deleted here");
        }

        scheduleRepository.delete(schedule);
    }

    // Post -> Schedule로 등록
    @Transactional
    public ScheduleResponse createFacilitySchedule(ScheduleCreateRequest request, Long userId, ScheduleType type) {
        if (request.getScheduledAt() == null)
            return null;

        Users createdUser = usersRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "사용자를 찾을 수 없습니다."));

        Facility facility = facilityRepository.findById(request.getFacilityId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "시설을 찾을 수 없습니다."));

        Schedule schedule = Schedule.builder()
                .facilityId(facility)
                .createdUserId(createdUser)
                .title(request.getTitle())
                .content(request.getContent())
                .type(type) // FACILITY 또는 PROGRAM
                .scheduledAt(request.getScheduledAt())
                .endAt(request.getEndAt())
                .build();

        return ScheduleResponse.fromEntity(scheduleRepository.save(schedule));
    }

}
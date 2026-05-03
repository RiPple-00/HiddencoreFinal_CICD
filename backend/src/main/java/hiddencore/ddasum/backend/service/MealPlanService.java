package hiddencore.ddasum.backend.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import hiddencore.ddasum.backend.domain.Facility;
import hiddencore.ddasum.backend.domain.MealPlan;
import hiddencore.ddasum.backend.domain.Users;
import hiddencore.ddasum.backend.repository.FacilityRepository;
import hiddencore.ddasum.backend.repository.MealPlanRepository;
import hiddencore.ddasum.backend.repository.MemberRepository;
import hiddencore.ddasum.backend.web.dto.MealPlanDto;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MealPlanService {

    private final MealPlanRepository mealPlanRepository;
    private final FacilityRepository facilityRepository;
    private final MemberRepository memberRepository;

    @Transactional
    public MealPlanDto.BulkUpsertResponse bulkUpsert(MealPlanDto.BulkUpsertRequest request,  Long adminId) {
        Facility facility = facilityRepository.findById(request.getFacilityId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "시설을 찾을 수 없습니다."));

        Users admin = memberRepository.findByUserId(adminId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "관리자 사용자를 찾을 수 없습니다."));

        int savedCount = 0;
        for (MealPlanDto.RowRequest row : request.getRows()) {
            MealPlan.Mealtype mealType = MealPlan.Mealtype.valueOf(row.getMealType());
            MealPlan.Diettype dietType = MealPlan.Diettype.valueOf(row.getDietType());

            MealPlan mealPlan = mealPlanRepository.findByMealDateAndMealTypeAndDietType(
                            row.getMealDate(), mealType, dietType)
                    .orElseGet(() -> MealPlan.builder()
                            .facilityId(facility)
                            .adminId(admin)
                            .mealDate(row.getMealDate())
                            .mealType(mealType)
                            .dietType(dietType)
                            .menu(row.getMenu())
                            .build());

            mealPlan.setFacilityId(facility);
            mealPlan.setAdminId(admin);
            mealPlan.setMealDate(row.getMealDate());
            mealPlan.setMealType(mealType);
            mealPlan.setDietType(dietType);
            mealPlan.setMenu(row.getMenu());
            mealPlan.setCalorie(safe(row.getCalorie()));
            mealPlan.setProtein(safe(row.getProtein()));

            mealPlanRepository.save(mealPlan);
            savedCount++;
        }

        return MealPlanDto.BulkUpsertResponse.builder()
                .requestedCount(request.getRows().size())
                .savedCount(savedCount)
                .build();
    }

    public void update(Long id, MealPlanDto.UpdateRequest request) {
        MealPlan mealPlan = mealPlanRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "식단을 찾을 수 없습니다."));
        mealPlan.setMenu(request.getMenu());
        mealPlanRepository.save(mealPlan);
    }

    @Transactional
    public void delete(Long id) {
        if (!mealPlanRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "식단을 찾을 수 없습니다.");
        }
        mealPlanRepository.deleteById(id);
    }

    public List<MealPlanDto.MealPlanResponse> getByDate(LocalDate mealDate, Long facilityId) {
        if (facilityId != null) {
            List<MealPlan> scoped = mealPlanRepository.findByMealDateAndFacilityPk(mealDate, facilityId);
            if (!scoped.isEmpty()) {
                return scoped.stream().map(this::toResponse).toList();
            }
        }
        return mealPlanRepository.findByMealDateOrderByMealTypeAsc(mealDate).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<MealPlanDto.MealPlanResponse> getByRange(LocalDate startDate, LocalDate endDate, Long facilityId) {
        if (facilityId != null) {
            List<MealPlan> scoped = mealPlanRepository.findByMealDateBetweenAndFacilityPk(startDate, endDate, facilityId);
            if (!scoped.isEmpty()) {
                return scoped.stream().map(this::toResponse).toList();
            }
        }
        return mealPlanRepository.findByMealDateBetweenOrderByMealDateAscMealTypeAsc(startDate, endDate).stream()
                .map(this::toResponse)
                .toList();
    }

    private MealPlanDto.MealPlanResponse toResponse(MealPlan mealPlan) {
        return MealPlanDto.MealPlanResponse.builder()
                .mealPlanId(mealPlan.getMeal_plan_id())
                .facilityId(mealPlan.getFacilityId().getFacilityId())
                .adminId(mealPlan.getAdminId().getUserId())
                .mealDate(mealPlan.getMealDate())
                .mealType(mealPlan.getMealType().name())
                .dietType(mealPlan.getDietType().name())
                .menu(mealPlan.getMenu())
                .calorie(safe(mealPlan.getCalorie()))
                .protein(safe(mealPlan.getProtein()))
                .build();
    }

    private Integer safe(Integer value) {
        return value != null ? value : 0;
    }
}

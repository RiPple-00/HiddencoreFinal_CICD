package hiddencore.ddasum.backend.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import hiddencore.ddasum.backend.domain.MealPlan;

@Repository
public interface MealPlanRepository extends JpaRepository<MealPlan, Long> {

    List<MealPlan> findByMealDateOrderByMealTypeAsc(LocalDate mealDate);

    List<MealPlan> findByMealDateBetweenOrderByMealDateAscMealTypeAsc(LocalDate startDate, LocalDate endDate);

    @Query("SELECT m FROM MealPlan m WHERE m.mealDate = :mealDate AND m.facilityId.facilityId = :facilityId ORDER BY m.mealType ASC")
    List<MealPlan> findByMealDateAndFacilityPk(@Param("mealDate") LocalDate mealDate, @Param("facilityId") Long facilityId);

    @Query("SELECT m FROM MealPlan m WHERE m.mealDate BETWEEN :start AND :end AND m.facilityId.facilityId = :facilityId ORDER BY m.mealDate ASC, m.mealType ASC")
    List<MealPlan> findByMealDateBetweenAndFacilityPk(
            @Param("start") LocalDate startDate,
            @Param("end") LocalDate endDate,
            @Param("facilityId") Long facilityId);
    List<MealPlan> findByMealDateOrderByMealType(LocalDate mealDate);

    List<MealPlan> findByMealDateBetweenOrderByMealDate(LocalDate startDate, LocalDate endDate);

    Optional<MealPlan> findByMealDateAndMealTypeAndDietType(
            LocalDate mealDate,
            MealPlan.Mealtype mealType,
            MealPlan.Diettype dietType
    );
}

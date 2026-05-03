package hiddencore.ddasum.backend.web.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder

public class CalendarMonthResponse {
    private Integer year;
    private Integer month;
    private List<ScheduleResponse> schedules;
}

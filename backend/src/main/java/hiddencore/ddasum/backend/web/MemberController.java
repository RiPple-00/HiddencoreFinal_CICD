package hiddencore.ddasum.backend.web;
  
import hiddencore.ddasum.backend.service.MemberService;
import hiddencore.ddasum.backend.web.dto.MemberDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
  
import java.util.List;
  
@Tag(name = "Users", description = "회원 API")
@RestController
@RequestMapping("/api/members") // 이 클래스의 시작 주소
@RequiredArgsConstructor 
public class MemberController {
    
    private final MemberService memberService;
  
      
    //회원 조회(ID)
    @Operation(summary = "회원 조회", description = "ID로 회원 정보를 조회합니다.")
    @ApiResponse(responseCode = "200", description = "조회 성공")
    @ApiResponse(responseCode = "404", description = "회원 없음")
    @GetMapping("/{id}")   //http://localhost:8080/api/members/5  
    public ResponseEntity <MemberDto.MemberResponse> getMember(
        @Parameter(description = "회원 ID") @PathVariable Long id){
        MemberDto.MemberResponse response = memberService.getMember(id);
        return ResponseEntity.ok(response);
    }

    //전체 목록 조회 (getAllMember)
    @Operation(summary = "회원 목록 조회", description = "전체 회원 목록을 조회합니다.")
    @ApiResponse(responseCode = "200", description = "조회 성공")
    @GetMapping    //http://localhost:8080/api/members
    public ResponseEntity<List<MemberDto.MemberResponse>> getAllMembers() {
        List<MemberDto.MemberResponse> response = memberService.getAllMembers();
        return ResponseEntity.ok(response);
    }
  
    //회원 정보 수정
    @Operation(summary = "회원 정보 수정", description = "회원 정보를 수정합니다.")
    @ApiResponse(responseCode = "200", description = "수정 성공")
    @ApiResponse(responseCode = "404", description = "회원 없음")
    @PutMapping("/{id}")   //http://localhost:8080/api/members/5
    public ResponseEntity <MemberDto.MemberResponse> updateMember(
        @Parameter(description = "회원 ID") @PathVariable Long id,
        @Valid @RequestBody MemberDto.UpdateRequest request){
        MemberDto.MemberResponse response = memberService.updateMember(id, request);
        return ResponseEntity.ok(response);
    }
  
    //회원 삭제
    @Operation(summary = "회원 삭제", description = "회원 상태를 삭제로 변경합니다.")
    @ApiResponse(responseCode = "204", description = "삭제(비활성) 처리 완료")
    @DeleteMapping("/{id}")   //http://localhost:8080/api/members/5
    public ResponseEntity<Void> deleteMember(
        @Parameter(description = "회원 ID") @PathVariable Long id){
        memberService.deleteMember(id);
        return ResponseEntity.noContent().build();
    }
             
} 

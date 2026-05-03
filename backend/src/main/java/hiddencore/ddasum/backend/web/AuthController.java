package hiddencore.ddasum.backend.web;

import hiddencore.ddasum.backend.service.MemberService;
import hiddencore.ddasum.backend.web.dto.MemberDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "Auth", description = "인증 API")
@RestController
@RequestMapping("/api/auth") // 무조건 있어야 함
@RequiredArgsConstructor
public class AuthController {
    
    //DI
    private final MemberService memberService;

    //회원가입
    @Operation(summary = "회원가입", description = "새로운 회원을 등록합니다.")
    @ApiResponse(responseCode = "201", description = "가입 성공")
    @ApiResponse(responseCode = "400", description = "유효성 검증 실패")
    @PostMapping("/signup")  //http://localhost:8080/api/auth/signup
    public ResponseEntity<MemberDto.MemberResponse> signUp(
        @Valid @RequestBody MemberDto.SignUpRequest request) {
            MemberDto.MemberResponse response = memberService.signUp(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response); //201
        
    }

    //로그인
    @Operation(summary = "로그인", description = "로그인하여 토큰을 발급받습니다.")
    @ApiResponse(responseCode = "200", description = "로그인 성공")
    @ApiResponse(responseCode = "401", description = "아이디 또는 비밀번호 불일치")
    @PostMapping("/login")   //http://localhost:8080/api/auth/login
    public ResponseEntity<MemberDto.LoginResponse> login(
            @Valid @RequestBody MemberDto.LoginRequest request) {
        MemberDto.LoginResponse response = memberService.login(request);
        return ResponseEntity.ok(response);  //200
    }
    

    // 사용자명 중복 체크
    @Operation(summary = "사용자명 중복 체크", description =  "사용자명 사용 가능 여부를 확인합니다.")
    @GetMapping("/check-username")    //http://localhost:8080/api/auth/check-username
    public  ResponseEntity<Map<String, Boolean>> checkUsername(
        @Parameter(description = "확인할 로그인 아이디", required = true) @RequestParam String username) {
        boolean available = memberService.isUsernameAvailable(username);
        return ResponseEntity.ok(Map.of("available", available));
    
        /* 
        Map.of("available", ture) -> 사용가능
        Map.of("available", false) -> 이미있음
        */
    }


    //이메일 중복 체크
    @Operation(summary = "이메일 중복 체크", description = "이메일 사용 가능 여부를 확인합니다.")
    @ApiResponse(responseCode = "200", description = "available: true면 사용 가능")
    @GetMapping("/check-email")
    public ResponseEntity<Map<String, Boolean>> checkEmail(
            @Parameter(description = "확인할 이메일", required = true) @RequestParam String email) {
        boolean available = memberService.isEmailAvailable(email);
        return ResponseEntity.ok(Map.of("available", available));
    }
    

}

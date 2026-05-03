import api from './index'; //http://localhost:8080/api

// 인증 API 서비스
const authApi = {

    // 회원가입
    signUp: (userData) => {
        return api.post('/auth/signup', userData);
    },

    /** 보호자 App 회원가입 (시설코드 없음) */
    guardianSignUp: (body) => api.post('/guardians/signup', body),

    /** 보호자 로그인 */
    guardianLogin: (body) => api.post('/auth/guardian/login', body),

    /** 직원 로그인 (시설코드 + 직원 ID) */
    employeeLogin: (body) => api.post('/auth/employee/login', body),

    /** 직원 계정 발급 (원무/관리자, Bearer 필요) */
    adminIssueEmployee: (body) => api.post('/admin/employees', body),

    changePassword: (body) => api.patch('/users/me/password', body),

    updateEmailConsent: (body) => api.patch('/users/me/email-consent', body),

    // 로그인
    login: (Credential) => {
        return api.post('/auth/login', Credential);
    },

    // 사용자명 중복 체크
    checkUsername: (username) => {
        return api.get('/auth/check-username',{ 
            params: {username}
        });
    },

    // 이메일 중복
    checkEmail: (email) => {
        return api.get('/auth/check-email',{
            params:{email}

        });
    }

};
export default authApi;
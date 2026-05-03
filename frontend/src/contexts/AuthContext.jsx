import { createContext, useContext, useState, useEffect} from 'react';

// Context 객체 생성
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => { // children: 모든 자식 컴포넌트

    const [user, setUser] = useState(null); // 로그인한 사용자의 정보
    const [loading, setLoading] = useState(true); // 초기 로딩 여부

    // 시작시 localStorage에서 사용자 정보 복원
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser)); // 문자열 -> JSON
            } catch (error) {
                console.error('사용자 정보 복원 실패:', error);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
        setLoading(false); // 복원 완료
    }, []);

    // 로그인
    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData)); // 브라우저 저장
        localStorage.setItem('token', userData.token); // 토큰 저장
    };

    // 로그아웃
    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    }

    // 로그인 여부(유저의 존재 여부)
    const isAuthenticated = !!user;
    //const isAuthenticated = "soldesk";

    // 관리자 여부
    const isAdmin = user?.role === 'ADMIN';

    const value = {
        user,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom Hook 인증정보 접근
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
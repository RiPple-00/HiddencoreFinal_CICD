import { createContext, useContext, useState, useEffect, Children } from "react";

// Context 객체 생성
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => { // children : 모든 자식 컴포넌트 

    const [user, setUser] = useState(null); // 로그인한 사용자의 정보
    const [loading, setLoading] = useState(true); // 초기 로그인 여부

    // 시작시 localStorage 에서 사용자 정보 복원
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (error) {
                console.error('사용자 정보 복원 실패:', error);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    // 로그인 성공시 호출
    const login = (userDate) => {
        setUser(userDate);
        localStorage.setItem('user', JSON.stringify(userDate));
        const t = userDate.token || userDate.accessToken;
        if (t) localStorage.setItem('token', t);
    };

    // 로그아웃
    const logout = () => {
        setUser(null)
        localStorage.removeItem('user');
        localStorage.removeItem('token');    
    };

    // 로그인 여부
    const isAuthenticated = !!user;

    const isAdmin = user?.role === 'ADMIN';
    const canIssueEmployees = user?.role === 'OFFICE' || user?.role === 'ADMIN';

    const value = {
        user,
        loading,
        isAuthenticated,
        isAdmin,
        canIssueEmployees,
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

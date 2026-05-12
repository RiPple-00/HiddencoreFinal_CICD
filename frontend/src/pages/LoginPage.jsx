import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast'; // 토스트 알림 
import authApi from '@/api/authApi'; // 회원가입 API
import Input from '@/components/Input'; 
import Button from '@/components/Button'; 
import { useAuth } from '@/contexts/AutoContext.jsx';

function LoginPage(){
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        userId: '',
        password: '',
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.userId) {
            newErrors.userId = '아이디를 입력해주세요.';
        }

        if (!formData.password) {
            newErrors.password = '비밀번호를 입력해주세요.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validate()) return;

        try {
            setLoading(true);
            const response = await authApi.guardianLogin({
                loginId: formData.userId,
                password: formData.password,
            });
            const token = response.data.accessToken;
            const userPayload = {
                token,
                accessToken: token,
                userId: formData.userId,
                username: formData.userId,
                role: response.data.role,
                mustChangePassword: response.data.mustChangePassword,
            };
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userPayload));
            login(userPayload);
            
            toast.success(`${userPayload.username}님, 환영합니다!`);
            if (userPayload.mustChangePassword) {
                navigate('/change-password');
            } else {
                navigate('/home');
            }
        } catch (error) {
            console.error('로그인 실패:', error);
        } finally {
            setLoading(false);
        }
    };

return (
        <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8">
                <h1 className="text-2xl font-bold text-center mb-2">보호자 로그인</h1>
                <p className="text-center text-sm text-gray-500 mb-6">
                    직원은 <Link to="/staff-login" className="text-blue-600 hover:underline">직원 로그인</Link>
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="아이디"
                        name="userId"
                        value={formData.userId}
                        onChange={handleChange}
                        placeholder="아이디"
                        error={errors.userId}
                    />

                    <Input
                        label="비밀번호"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="비밀번호"
                        error={errors.password}
                    />

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                    >
                        {loading ? '로그인 중...' : '로그인'}
                    </Button>
                </form>

                <p className="text-center mt-6 text-gray-600">
                    계정이 없으신가요?{' '}
                    <Link to="/signup" className="text-blue-600 hover:underline">
                        회원가입
                    </Link>
                </p>
            </div>
        </div>
    );

}

export default LoginPage;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import authApi from '@/api/authApi';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { useAuth } from '../contexts/AutoContext.jsx';

export default function StaffLoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        facilityCode: '',
        employeeLoginId: '',
        password: '',
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const next = {};
        if (!form.facilityCode || form.facilityCode.length !== 8) {
            next.facilityCode = '시설코드 8자리를 입력해주세요.';
        }
        if (!form.employeeLoginId || form.employeeLoginId.length !== 10) {
            next.employeeLoginId = '직원 ID 10자리를 입력해주세요.';
        }
        if (!form.password) next.password = '비밀번호를 입력해주세요.';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        try {
            setLoading(true);
            const { data } = await authApi.employeeLogin({
                facilityCode: form.facilityCode.trim(),
                employeeLoginId: form.employeeLoginId.trim(),
                password: form.password,
            });
            const token = data.accessToken;
            const userPayload = {
                token,
                accessToken: token,
                role: data.role,
                mustChangePassword: data.mustChangePassword,
                username: form.employeeLoginId,
                userId: form.employeeLoginId,
            };
            login(userPayload);
            toast.success('로그인되었습니다.');
            if (data.mustChangePassword) {
                navigate('/change-password');
            } else {
                navigate(data.role === 'DOCTOR' ? '/doctor' : '/ward');
            }
        } catch {
            /* axios interceptor */
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
                <h1 className="text-2xl font-bold text-center mb-2 text-slate-800">직원 로그인</h1>
                <p className="text-center text-sm text-slate-500 mb-6">시설코드 · 직원 ID · 비밀번호</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="시설코드 (8자리)"
                        name="facilityCode"
                        value={form.facilityCode}
                        onChange={handleChange}
                        placeholder="12345678"
                        maxLength={8}
                        error={errors.facilityCode}
                    />
                    <Input
                        label="직원 ID (10자리)"
                        name="employeeLoginId"
                        value={form.employeeLoginId}
                        onChange={handleChange}
                        placeholder="2126042601"
                        maxLength={10}
                        error={errors.employeeLoginId}
                    />
                    <Input
                        label="비밀번호"
                        name="password"
                        type="password"
                        autoComplete="current-password" 
                        value={form.password}
                        onChange={handleChange}
                        error={errors.password}
                    />
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? '로그인 중...' : '로그인'}
                    </Button>
                </form>
            </div>
        </div>
    );
}

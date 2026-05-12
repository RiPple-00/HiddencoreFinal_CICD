import { useState } from 'react';
import toast from 'react-hot-toast';
import authApi from '@/api/authApi';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { useAuth } from '@/contexts/AutoContext.jsx';

export default function ChangePasswordPage() {
    const { user, isAuthenticated, logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ currentPassword: '', newPassword: '', newPassword2: '' });
    const [errors, setErrors] = useState({});

    if (!isAuthenticated) {
        return (
            <div className="max-w-md mx-auto mt-10 text-center text-slate-600">
                로그인이 필요합니다.
                <Button className="mt-4" onClick={() => (window.location.href = '/staff-login')}>
                    직원 로그인
                </Button>
            </div>
        );
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((p) => ({ ...p, [name]: value }));
        if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
    };

    const validate = () => {
        const next = {};
        if (!form.currentPassword) next.currentPassword = '현재 비밀번호를 입력해주세요.';
        if (!form.newPassword || form.newPassword.length < 8) {
            next.newPassword = '새 비밀번호는 8자 이상이어야 합니다.';
        }
        if (form.newPassword !== form.newPassword2) {
            next.newPassword2 = '새 비밀번호가 일치하지 않습니다.';
        }
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        try {
            setLoading(true);
            await authApi.changePassword({
                currentPassword: form.currentPassword,
                newPassword: form.newPassword,
            });
            toast.success('비밀번호가 변경되었습니다.');
            const next = { ...user, mustChangePassword: false };
            localStorage.setItem('user', JSON.stringify(next));
            window.location.href = user?.role === 'GUARDIAN' ? '/home' : '/ward';
        } catch {
            /* interceptor */
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
                <h1 className="text-2xl font-bold text-center mb-6 text-slate-800">비밀번호 변경</h1>
                {user?.mustChangePassword && (
                    <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                        최초 로그인입니다. 비밀번호를 변경해 주세요.
                    </p>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="현재 비밀번호"
                        name="currentPassword"
                        type="password"
                        value={form.currentPassword}
                        onChange={handleChange}
                        error={errors.currentPassword}
                    />
                    <Input
                        label="새 비밀번호 (8자 이상)"
                        name="newPassword"
                        type="password"
                        value={form.newPassword}
                        onChange={handleChange}
                        error={errors.newPassword}
                    />
                    <Input
                        label="새 비밀번호 확인"
                        name="newPassword2"
                        type="password"
                        value={form.newPassword2}
                        onChange={handleChange}
                        error={errors.newPassword2}
                    />
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? '처리 중...' : '변경하기'}
                    </Button>
                    <Button type="button" variant="secondary" className="w-full" onClick={() => logout()}>
                        로그아웃
                    </Button>
                </form>
            </div>
        </div>
    );
}

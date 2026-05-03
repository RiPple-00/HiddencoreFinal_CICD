import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import authApi from '../api/authApi';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../contexts/AutoContext.jsx';

export default function AdminEmployeeIssuePage() {
    const { isAuthenticated, canIssueEmployees } = useAuth();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        phone: '',
        email: '',
        role: 'DOCTOR',
        hireDate: '',
        emailAgreed: true,
    });

    if (!isAuthenticated || !canIssueEmployees) {
        return (
            <div className="max-w-lg mx-auto mt-10 text-center text-slate-600 space-y-4">
                <p>원무(또는 관리자) 계정으로 로그인한 경우에만 직원을 발급할 수 있습니다.</p>
                <Link to="/staff-login" className="text-emerald-600 hover:underline">
                    직원 로그인
                </Link>
            </div>
        );
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((p) => ({
            ...p,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.hireDate) {
            toast.error('입사일을 선택해주세요.');
            return;
        }
        try {
            setLoading(true);
            const { data } = await authApi.adminIssueEmployee({
                name: form.name.trim(),
                phone: form.phone.trim(),
                email: form.email.trim(),
                role: form.role,
                hireDate: form.hireDate,
                emailAgreed: Boolean(form.emailAgreed),
            });
            toast.success(data.message || '발급되었습니다.');
            setForm((p) => ({ ...p, name: '', phone: '', email: '', hireDate: '' }));
        } catch {
            /* axios */
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto mt-10">
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
                <h1 className="text-2xl font-bold text-slate-800 mb-2">직원 계정 발급</h1>
                <p className="text-sm text-slate-500 mb-6">
                    임시 비밀번호는 응답에 포함되지 않으며, 입력한 이메일로만 전송됩니다.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="이름" name="name" value={form.name} onChange={handleChange} required />
                    <Input label="전화번호" name="phone" value={form.phone} onChange={handleChange} required />
                    <Input label="이메일" name="email" type="email" value={form.email} onChange={handleChange} required />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">직군</label>
                        <select
                            name="role"
                            value={form.role}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        >
                            <option value="OFFICE">원무 (OFFICE)</option>
                            <option value="DOCTOR">의사 (DOCTOR)</option>
                            <option value="CAREGIVER">요양사 (CAREGIVER)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">입사일</label>
                        <input
                            type="date"
                            name="hireDate"
                            value={form.hireDate}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            required
                        />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input type="checkbox" name="emailAgreed" checked={form.emailAgreed} onChange={handleChange} />
                        이메일 수신 동의 (마케팅·정보 수신; 직원 안내 메일과 별개)
                    </label>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? '발급 중...' : '계정 발급'}
                    </Button>
                </form>
                <p className="text-center mt-6 text-sm">
                    <Link to="/" className="text-emerald-600 hover:underline">
                        홈으로
                    </Link>
                </p>
            </div>
        </div>
    );
}

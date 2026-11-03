import { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Lock, ShieldCheck, User, UserPlus } from 'lucide-react';
import TextField from './TextField';
import MagneticButton from './MagneticButton';
import PasswordStrength from './PasswordStrength';
import { useToast } from './Toast';
import { useAuth } from '../hooks/useAuth';
import { ApiError } from '../services/api';
import { checkPassword, checkUsername } from '../services/validation';
import { container, item } from '../animations/variants';

type Key = 'username' | 'password' | 'confirm';

interface Props {
  mode: 'login' | 'register';
  onSwitch: () => void;
  onSuccess?: () => void;
}

export default function AuthForm({ mode, onSwitch, onSuccess }: Props) {
  const isReg = mode === 'register';
  const { login, register } = useAuth();
  const toast = useToast();
  const [f, setF] = useState<Record<Key, string>>({ username: '', password: '', confirm: '' });
  const [touched, setTouched] = useState<Partial<Record<Key, boolean>>>({});
  const [server, setServer] = useState<Partial<Record<Key, string>>>({});
  const [loading, setLoading] = useState(false);

  const errors: Record<Key, string> = {
    username: isReg ? checkUsername(f.username) : f.username ? '' : 'Informe seu username.',
    password: isReg ? checkPassword(f.password) : f.password ? '' : 'Informe sua senha.',
    confirm: isReg && f.confirm !== f.password ? 'As senhas não coincidem.' : '',
  };
  const err = (k: Key) => (touched[k] ? server[k] || errors[k] : '');
  const set = (k: Key) => (v: string) => { setF((p) => ({ ...p, [k]: v })); setServer({}); };
  const blur = (k: Key) => () => setTouched((t) => ({ ...t, [k]: true }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({ username: true, password: true, confirm: true });
    if (errors.username || errors.password || errors.confirm) return toast('error', 'Corrija os campos destacados.');
    setLoading(true);
    try {
      if (isReg) { await register(f.username, f.password, f.confirm); toast('success', 'Conta criada! Bem-vindo ao Authverse.'); }
      else { await login(f.username, f.password); toast('success', 'Acesso autorizado.'); }
      onSuccess?.();
    } catch (ex) {
      const a = ex as ApiError;
      if (a.field) setServer({ [a.field === 'confirmPassword' ? 'confirm' : a.field]: a.message });
      toast('error', a.message);
      setLoading(false);
    }
  };

  return (
    <motion.form variants={container} initial="hidden" animate="show" onSubmit={submit} noValidate className="space-y-5">
      <motion.div variants={item} className="text-center">
        <h2 className="text-2xl font-semibold">{isReg ? 'Crie sua identidade' : 'Bem-vindo de volta'}</h2>
        <p className="mt-1 text-sm text-slate-400">{isReg ? 'Escolha um username único e uma senha forte.' : 'Entre com seu username e sua senha.'}</p>
      </motion.div>
      <TextField label="Username" icon={User} value={f.username} onChange={set('username')} onBlur={blur('username')}
        error={err('username')} ok={isReg && !!touched.username && !!f.username && !err('username')} autoComplete="username" maxLength={20} />
      <div>
        <TextField label="Senha" icon={Lock} type="password" value={f.password} onChange={set('password')} onBlur={blur('password')}
          error={err('password')} autoComplete={isReg ? 'new-password' : 'current-password'} maxLength={72} />
        {isReg && <PasswordStrength value={f.password} />}
      </div>
      {isReg && (
        <TextField label="Confirmar senha" icon={ShieldCheck} type="password" value={f.confirm} onChange={set('confirm')} onBlur={blur('confirm')}
          error={err('confirm')} autoComplete="new-password" maxLength={72} />
      )}
      <motion.div variants={item}>
        <MagneticButton type="submit" loading={loading}>{isReg ? <><UserPlus size={18} /> Criar conta</> : <><LogIn size={18} /> Entrar</>}</MagneticButton>
      </motion.div>
      <motion.p variants={item} className="text-center text-sm text-slate-400">
        {isReg ? 'Já tem uma conta?' : 'Ainda não tem conta?'}{' '}
        <button type="button" onClick={onSwitch} className="font-semibold text-cyan-300 transition hover:text-cyan-200 hover:underline">
          {isReg ? 'Entrar' : 'Criar conta'}
        </button>
      </motion.p>
    </motion.form>
  );
}

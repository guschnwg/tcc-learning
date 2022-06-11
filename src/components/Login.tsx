import { FormEvent } from "react";
import supabase, { LEVELS_TABLE, USER_DATA_TABLE } from '../supabase';
import { PostgrestError } from '@supabase/supabase-js'
import Button from "./Button";

const Login: React.FC<LoginProps> = ({ onError, onLogin }) => {
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const user = (event.target as HTMLFormElement)["user"].value;

    if (!user) {
      alert("Informe o nome do jogador")
      return;
    }

    const { data, error } = await supabase.from(USER_DATA_TABLE).select().eq('user', user);
    if (error) {
      onError(error);
      return;
    }
    if (data && data[0]) {
      onLogin(data[0]);
      window.localStorage.setItem("user", user);
      return;
    }

    if (window.confirm("Criar novo jogador?")) {
      const { data, error } = await supabase.from(USER_DATA_TABLE).insert([{ user, data: [] }]);

      if (data && data[0]) {
        onLogin(data[0]);
        window.localStorage.setItem("user", user);
      }

      if (error) {
        onError(error);
      }
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <div>
        <label htmlFor="user">Nome do Jogador</label>
        <input name="user" id="user" defaultValue={window.localStorage.getItem("user") || ""} />
      </div>
      <div>
        <Button>Entrar</Button>
      </div>
    </form>
  )
}

export default Login;
import React, { FormEvent } from "react";
import supabase from '../supabase';
import Button from "./Button";

async function loginOrRegister(email: string) {
  const authData = { email: email, password: email };

  const response = await supabase.auth.signIn(authData);
  if (!response.error) {
    return response;
  }

  return await supabase.auth.signUp(authData);
}

const Login: React.FC<LoginProps> = ({ onAuth }) => {
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const userName = (event.target as HTMLFormElement)["user"].value;
    if (!userName) {
      alert("Informe o nome do jogador")
      return;
    }

    const { user, session, error } = await loginOrRegister(userName + "@lalalala.com");

    onAuth({ user, session, error });
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
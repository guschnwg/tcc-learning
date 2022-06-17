import React, { FormEvent, useEffect, useState } from "react";
import supabase, { MODES_TABLE } from '../supabase';
import Button from "./Button";

async function loginOrRegister(email: string) {
  const authData = { email: email, password: email };

  let response = await supabase.auth.signIn(authData);
  if (!response.error) {
    return { response, isNew: false };
  }

  response = await supabase.auth.signUp(authData);
  return { response, isNew: true };
}

const Login: React.FC<LoginProps> = ({ onAuth }) => {
  const [guessLimit, setGuessLimit] = useState(window.localStorage.getItem("guess_limit") || "5");
  const [modes, setModes] = useState<ModeEntity[]>();

  useEffect(() => {
    supabase.from(MODES_TABLE).select().then(({ data }) => setModes(data ?? undefined))
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const userName = (event.target as HTMLFormElement)["user"].value;
    const mode = Number((event.target as HTMLFormElement)["mode"].value || "1");

    if (!userName || !mode) {
      alert("Informe o nome do jogador e o modo de jogo")
      return;
    }

    const { response: { user, session, error }, isNew } = await loginOrRegister(userName + "@lalalala.com");

    onAuth({ user, session, error }, Number(guessLimit), mode, isNew);
  }

  if (!modes) {
    return null;
  }

  return (
    <form onSubmit={onSubmit}>
      <div>
        <label htmlFor="user">Nome do Jogador</label>
        <input name="user" id="user" defaultValue={window.localStorage.getItem("user") || ""} />
      </div>
      <div>
        <label htmlFor="mode">Modo de Jogo</label>
        <select name="mode" id="mode" defaultValue={window.localStorage.getItem("mode") || "1"}>
          {modes.map(mode => (
            <option key={mode.id} value={mode.id}>{mode.title}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="guess_limit">Número de Palpites: {guessLimit === "0" ? "Ilimitado" : guessLimit}</label>
        <input
          type="range"
          name="guess_limit"
          id="guess_limit"
          defaultValue={guessLimit}
          onInput={e => setGuessLimit((e.target as HTMLInputElement).value)}
          min="0"
          max="10"
        />
      </div>
      <div>
        <Button>Entrar</Button>
      </div>
    </form>
  )
}

export default Login;
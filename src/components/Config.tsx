import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCog, faTimes } from '@fortawesome/free-solid-svg-icons'

import React, { useContext, useState } from "react";
import Button from "./Button";
import Modal from './Modal';

interface ConfigData {
  lowSpecs: boolean
  mute: boolean
}

interface ConfigFns {
  setConfig: (key: keyof ConfigData, value: any) => void
}

type ContextValue = ConfigData & ConfigFns

const defaultValue = {
  lowSpecs: window.localStorage.getItem("lowSpecs") === "true",
  mute: window.localStorage.getItem("mute") === "true",
};
const ConfigContext = React.createContext<ContextValue>({
  ...defaultValue,
  setConfig(key, value) {
    return;
  },
});

const ConfigContextProvider: React.FC = ({ children }) => {
  const [data, setData] = useState<ConfigData>(defaultValue);

  const setConfig = (key: keyof ConfigData, value: any) => {
    window.localStorage.setItem(key, value.toString());
    setData(prev => ({ ...prev, [key]: value }));
  }

  return (
    <ConfigContext.Provider value={{ ...data, setConfig }}>
      {children}
    </ConfigContext.Provider >
  )
};

const ConfigModal: React.FC<{ show: boolean, onClose: () => void }> = ({ show, onClose }) => {
  const { lowSpecs, mute, setConfig } = useContext(ConfigContext);

  return (
    <Modal show={show} onHide={onClose}>
      <div className="Config-title">
        <h3>Configurações</h3>

        <Button className='small' onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </Button>
      </div>

      <div className="Config-config">
        <label htmlFor="mute">Desativar sons</label>

        <select
          id="mute"
          name="mute"
          onChange={event => setConfig("mute", event.target.value === "true")}
          defaultValue={mute.toString()}
        >
          <option value="true">Sim</option>
          <option value="false">Não</option>
        </select>
      </div>

      <div className="Config-config">
        <label htmlFor="low-specs">Jogo mais leve?</label>

        <select
          id="low-specs"
          name="low-specs"
          onChange={event => setConfig("lowSpecs", event.target.value === "true")}
          defaultValue={lowSpecs.toString()}
        >
          <option value="true">Sim</option>
          <option value="false">Não</option>
        </select>
      </div>
    </Modal>
  )
}

const Config: React.FC = () => {
  const [showConfig, setShowConfig] = useState(false);

  return (
    <>
      <Button onClick={() => setShowConfig(true)}>
        <FontAwesomeIcon icon={faCog} />
      </Button>

      <ConfigModal
        show={showConfig}
        onClose={() => setShowConfig(false)}
      />
    </>
  )
}

export { ConfigContext, ConfigContextProvider };

export default Config;

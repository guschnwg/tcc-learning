import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCog, faTimes } from '@fortawesome/free-solid-svg-icons'

import React, { useState } from "react";
import Button from "./Button";
import Modal from './Modal';

const SettingsModal: React.FC<{ show: boolean, onClose: () => void }> = ({ show, onClose }) => {
  return (
    <Modal show={show} onHide={onClose}>
      <div className="settings-title">
        <h3>Configurações</h3>

        <Button className='small' onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </Button>
      </div>

      <div className="settings-config">
        <label htmlFor="mute">Desativar sons</label>

        <select
          id="mute"
          name="mute"
          onChange={event => window.localStorage.setItem("mute", event.target.value)}
          defaultValue={window.localStorage.getItem("mute") || "false"}
        >
          <option value="true">Sim</option>
          <option value="false">Não</option>
        </select>
      </div>

      <div className="settings-config">
        <label htmlFor="low-specs">Jogo mais leve?</label>

        <select
          id="low-specs"
          name="low-specs"
          onChange={event => window.localStorage.setItem("low-specs", event.target.value)}
          defaultValue={window.localStorage.getItem("low-specs") || "false"}
        >
          <option value="true">Sim</option>
          <option value="false">Não</option>
        </select>
      </div>
    </Modal>
  )
}

const Settings: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <Button onClick={() => setShowSettings(true)}>
        <FontAwesomeIcon icon={faCog} />
      </Button>

      <SettingsModal show={showSettings} onClose={() => setShowSettings(false)} />
    </>
  )
}

export default Settings;

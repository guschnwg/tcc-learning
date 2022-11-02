import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQuestion } from '@fortawesome/free-solid-svg-icons'

import React, { useContext, useState } from "react";
import Button from "./Button";
import Modal from './Modal';
import { ConfigContext } from './Config';

const TutorialModal: React.FC<{ guessLimit: number, show: boolean, onClose: () => void }> = ({ guessLimit, show, onClose }) => {
  const { lowSpecs } = useContext(ConfigContext);

  return (
    <Modal className='tutorial-modal' show={show} onHide={onClose}>
      <h2>Tutorial</h2>

      <h3>Navegação</h3>

      {lowSpecs ? (
        <ul>
          <li>Use as setas no chão para se mover</li>
          <li>Clique na bússola no lado direito para girar a visão</li>
          <li>Clique no botões de + para aproximar e de - para se afastar</li>
        </ul>
      ) : (
          <ul>
            <li>Clique e arraste no mapa para girar a câmera</li>
            <li>Clique nos &quot;X&quot; no chão para se mover</li>
          </ul>
      )}

      <h3>Dicas</h3>

      <ul>
        <li>Clique no botão &quot;Dicas&quot; se estiver sem ideias</li>
      </ul>

      <h3>Palpitar</h3>

      <ul>
        <li>Clique em &quot;Palpitar&quot; para uma tentativa</li>
        <li>Clique em qualquer lugar no mapa para dar seu palpite e ver a distância do local correto</li>
        <li>Você tem {guessLimit} tentativas, use com sabedoria</li>
      </ul>

      <h3>Níveis</h3>

      <ul>
        <li>Clique em &quot;Níveis&quot; para escolher um nível para jogar</li>
        <li>Clique em &quot;Pular&quot; para ir ao próximo nível</li>
      </ul>

      <Button className="full-width" onClick={onClose}>
        Vamos lá!
      </Button>
    </Modal>
  )
}

const Tutorial: React.FC<{ guessLimit: number, show: boolean }> = ({ guessLimit, show }) => {
  const [showTutorial, setShowTutorial] = useState(show);

  return (
    <>
      <Button onClick={() => setShowTutorial(true)}>
        <FontAwesomeIcon icon={faQuestion} />
      </Button>

      <TutorialModal guessLimit={guessLimit} show={showTutorial} onClose={() => setShowTutorial(false)} />
    </>
  )
}

export default Tutorial;

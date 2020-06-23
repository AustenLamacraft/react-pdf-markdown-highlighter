// @flow

import React, { useState } from "react";

import processMd from './markdown'
import "./style/Tip.css";

// type State = {
//   compact: boolean,
//   text: string,
//   emoji: string
// };

type Props = {
  onConfirm: (comment: { text: string, emoji: string }) => void,
  onOpen: () => void,
  onUpdate?: () => void
};

function Tip(props: Props) {

  const [state, setState] = useState({
    compact: true,
    text: '',
    emoji: '',
  });

  // // for TipContainer
  // componentDidUpdate(nextProps: Props, nextState: State) {
  //   const { onUpdate } = props;

  //   if (onUpdate && state.compact !== nextState.compact) {
  //     onUpdate();
  //   }
  // }

  const { onConfirm, onOpen } = props;
  const { compact, text, emoji } = state;

  return (
    <div className="Tip">
      {compact ? (
        <div
          className="Tip__compact"
          onClick={() => {
            onOpen();
            setState({ compact: false });
          }}
        >
          Add highlight
        </div>
      ) : (
        <form
          className="Tip__card"
          onSubmit={event => {
            event.preventDefault();
            onConfirm({ text, emoji });
          }}
        >
          <div>
            <textarea
              width="100%"
              placeholder="Your comment"
              autoFocus
              value={text}
              onChange={event => setState({ text: event.target.value })}
              ref={node => {
                if (node) {
                  node.focus();
                }
              }}
            />
            {/* <div>
              {["💩", "😱", "😍", "🔥", "😳"].map(_emoji => (
                <label key={_emoji}>
                  <input
                    checked={emoji === _emoji}
                    type="radio"
                    name="emoji"
                    value={_emoji}
                    onChange={event =>
                      setState({ emoji: event.target.value })
                    }
                  />
                  {_emoji}
                </label>
              ))}
            </div> */}
          </div>
          <div 
            id="preview"
            width='100%'
            >
            {
              processMd(state.text)
            }
          </div>
          <div>
            <input type="submit" value="Save" />
          </div>
        </form>
      )}
    </div>
  );
}

export default Tip;

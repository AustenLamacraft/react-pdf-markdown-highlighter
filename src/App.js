// @flow

// Based on https://github.com/agentcooper/react-pdf-highlighter/tree/master/packages/example
// rewritten with hooks

import React, { useState, useEffect, useRef } from "react";
import URLSearchParams from "url-search-params";

import {
  PdfLoader,
  PdfHighlighter,
  Highlight,
  Popup,
  AreaHighlight
} from "react-pdf-highlighter";

import testHighlights from "./test-highlights";

import Spinner from "./Spinner";
import Sidebar from "./Sidebar";
import Tip from "./Tip";
import processMd from "./markdown"

import type {
  T_Highlight,
  T_NewHighlight
} from "react-pdf-highlighter/src/types";

import "./style/App.css";

// type T_ManuscriptHighlight = T_Highlight;
// type State = {
//   highlights: Array<T_ManuscriptHighlight>
// };

const getNextId = () => String(Math.random()).slice(2);

const parseIdFromHash = () =>
  document.location.hash.slice("#highlight-".length);

const resetHash = () => {
  document.location.hash = "";
};

const HighlightPopup = ({ comment }) =>
  comment.text ? (
    <div className="Highlight__popup">
      {comment.emoji} {processMd(comment.text)}
    </div>
  ) : null;

const DEFAULT_URL = "https://arxiv.org/pdf/1708.08021.pdf";

const searchParams = new URLSearchParams(document.location.search);
const url = searchParams.get("url") || DEFAULT_URL;

function App() {

  const [state, setState] = useState({ highlights: testHighlights[url] ? [...testHighlights[url]] : [] })
  // not using the State type!

  // Jumping to highlight 

  // This function was defined and changed later! I'm not sure why it was used instead of a ref
  // let scrollViewerTo = (highlight: any) => { };
  // https://stackoverflow.com/questions/24841855/how-to-access-component-methods-from-outside-in-reactjs

  const pdfHighlighter = useRef(null)
  const getHighlightById = id => state.highlights.find(highlight => highlight.id === id)
  const scrollToHighlightFromHash = () => {
    const highlight = getHighlightById(parseIdFromHash());
    if (highlight) {
      pdfHighlighter.current.scrollTo(highlight);
    }
  };

  useEffect(() => {
    window.addEventListener(
      "hashchange",
      scrollToHighlightFromHash,
      false
    );

    return () => window.removeEventListener("hashchange", scrollToHighlightFromHash);
  });

  // State setting functions

  const resetHighlights = () => {
    setState({
      highlights: []
    });
  };

  function addHighlight(highlight: T_NewHighlight) {
    const { highlights } = state;

    console.log("Saving highlight", highlight);

    setState({
      highlights: [{ ...highlight, id: getNextId() }, ...highlights]
    });
  }

  const deleteHighlight = (index: number) => {
    const highlights = state.highlights.filter((highlight, idx) => {
      if (index !== idx) {
        return highlight
      }
    })
    setState({ highlights })
  }

  function updateHighlight(highlightId: string, position: Object, content: Object) {
    console.log("Updating highlight", highlightId, position, content);

    setState({
      highlights: state.highlights.map(h => {
        return h.id === highlightId
          ? {
            ...h,
            position: { ...h.position, ...position },
            content: { ...h.content, ...content }
          }
          : h;
      })
    });
  }

  const { highlights } = state;

  return (
    <div className="App" style={{ display: "flex", height: "100vh" }}>
      <Sidebar
        highlights={highlights}
        resetHighlights={resetHighlights}
        deleteHighlight={deleteHighlight}
      />
      <div
        style={{
          height: "100vh",
          width: "75vw",
          overflowY: "scroll",
          position: "relative"
        }}
      >
        <PdfLoader url={url} beforeLoad={<Spinner />}>
          {pdfDocument => (
            <PdfHighlighter
              ref={pdfHighlighter}
              pdfDocument={pdfDocument}
              enableAreaSelection={event => event.altKey}
              onScrollChange={resetHash}
              scrollRef={scrollTo => { }}
              onSelectionFinished={(
                position,
                content,
                hideTipAndSelection,
                transformSelection
              ) => (
                  <Tip
                    onOpen={transformSelection}
                    onConfirm={comment => {
                      addHighlight({ content, position, comment });

                      hideTipAndSelection();
                    }}
                  />
                )}
              highlightTransform={(
                highlight,
                index,
                setTip,
                hideTip,
                viewportToScaled,
                screenshot,
                isScrolledTo
              ) => {
                const isTextHighlight = !Boolean(
                  highlight.content && highlight.content.image
                );

                const component = isTextHighlight ? (
                  <Highlight
                    isScrolledTo={isScrolledTo}
                    position={highlight.position}
                    comment={highlight.comment}
                  />
                ) : (
                    <AreaHighlight
                      highlight={highlight}
                      onChange={boundingRect => {
                        updateHighlight(
                          highlight.id,
                          { boundingRect: viewportToScaled(boundingRect) },
                          { image: screenshot(boundingRect) }
                        );
                      }}
                    />
                  );

                return (
                  <Popup
                    popupContent={<HighlightPopup {...highlight} />}
                    onMouseOver={popupContent =>
                      setTip(highlight, highlight => popupContent)
                    }
                    onMouseOut={hideTip}
                    key={index}
                    children={component}
                  />
                );
              }}
              highlights={highlights}
            />
          )}
        </PdfLoader>
      </div>
    </div>
  );

}


// class App extends Component<Props, State> {
//   state = {
//     highlights: testHighlights[url] ? [...testHighlights[url]] : []
//   };

//   state: State;

//   resetHighlights = () => {
//     this.setState({
//       highlights: []
//     });
//   };

//   scrollViewerTo = (highlight: any) => { };

//   scrollToHighlightFromHash = () => {
//     const highlight = this.getHighlightById(parseIdFromHash());

//     if (highlight) {
//       this.scrollViewerTo(highlight);
//     }
//   };

//   componentDidMount() {
//     window.addEventListener(
//       "hashchange",
//       this.scrollToHighlightFromHash,
//       false
//     );
//   }

//   getHighlightById(id: string) {
//     const { highlights } = this.state;

//     return highlights.find(highlight => highlight.id === id);
//   }

//   addHighlight(highlight: T_NewHighlight) {
//     const { highlights } = this.state;

//     console.log("Saving highlight", highlight);

//     this.setState({
//       highlights: [{ ...highlight, id: getNextId() }, ...highlights]
//     });
//   }

//   updateHighlight(highlightId: string, position: Object, content: Object) {
//     console.log("Updating highlight", highlightId, position, content);

//     this.setState({
//       highlights: this.state.highlights.map(h => {
//         return h.id === highlightId
//           ? {
//             ...h,
//             position: { ...h.position, ...position },
//             content: { ...h.content, ...content }
//           }
//           : h;
//       })
//     });
//   }

//   render() {
//     const { highlights } = this.state;

//     return (
//       <div className="App" style={{ display: "flex", height: "100vh" }}>
//         <Sidebar
//           highlights={highlights}
//           resetHighlights={this.resetHighlights}
//         />
//         <div
//           style={{
//             height: "100vh",
//             width: "75vw",
//             overflowY: "scroll",
//             position: "relative"
//           }}
//         >
//           <PdfLoader url={url} beforeLoad={<Spinner />}>
//             {pdfDocument => (
//               <PdfHighlighter
//                 pdfDocument={pdfDocument}
//                 enableAreaSelection={event => event.altKey}
//                 onScrollChange={resetHash}
//                 scrollRef={scrollTo => {
//                   this.scrollViewerTo = scrollTo;

//                   this.scrollToHighlightFromHash();
//                 }}
//                 onSelectionFinished={(
//                   position,
//                   content,
//                   hideTipAndSelection,
//                   transformSelection
//                 ) => (
//                     <Tip
//                       onOpen={transformSelection}
//                       onConfirm={comment => {
//                         this.addHighlight({ content, position, comment });

//                         hideTipAndSelection();
//                       }}
//                     />
//                   )}
//                 highlightTransform={(
//                   highlight,
//                   index,
//                   setTip,
//                   hideTip,
//                   viewportToScaled,
//                   screenshot,
//                   isScrolledTo
//                 ) => {
//                   const isTextHighlight = !Boolean(
//                     highlight.content && highlight.content.image
//                   );

//                   const component = isTextHighlight ? (
//                     <Highlight
//                       isScrolledTo={isScrolledTo}
//                       position={highlight.position}
//                       comment={highlight.comment}
//                     />
//                   ) : (
//                       <AreaHighlight
//                         highlight={highlight}
//                         onChange={boundingRect => {
//                           this.updateHighlight(
//                             highlight.id,
//                             { boundingRect: viewportToScaled(boundingRect) },
//                             { image: screenshot(boundingRect) }
//                           );
//                         }}
//                       />
//                     );

//                   return (
//                     <Popup
//                       popupContent={<HighlightPopup {...highlight} />}
//                       onMouseOver={popupContent =>
//                         setTip(highlight, highlight => popupContent)
//                       }
//                       onMouseOut={hideTip}
//                       key={index}
//                       children={component}
//                     />
//                   );
//                 }}
//                 highlights={highlights}
//               />
//             )}
//           </PdfLoader>
//         </div>
//       </div>
//     );
//   }
// }

export default App;

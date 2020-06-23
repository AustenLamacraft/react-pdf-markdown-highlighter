import React from "react";

import unified from 'unified'
import parse from 'remark-parse'
import remark2rehype from 'remark-rehype'
import rehype2react from 'rehype-react'
import math from 'remark-math'
import katex from 'rehype-katex'

function processMd(text) {
  return (
    unified()
    .use(parse)
    .use(math)
    .use(remark2rehype)
    .use(katex)
    .use(rehype2react, {createElement: React.createElement})
    .processSync(text).result
  )
}

export default processMd;

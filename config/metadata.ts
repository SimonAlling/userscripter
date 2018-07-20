import U from "./userscript";

export default `
@name         ${U.name}
@version      ${U.version}
@description  ${U.description}
@author       ${U.author}
@match        *://${U.hostname}/*
@match        *://www.${U.hostname}/*
@namespace    ${U.namespace}
@run-at       ${U.runAt}
`;

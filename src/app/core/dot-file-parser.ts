import parse, {EdgeStmt, NodeStmt, Stmt, Subgraph} from "dotparser";
import {IEffect$, INavListItem, IReducer} from "../models";

export class DotFileParser {

  createDotSrc(actions: string[], effects$: IEffect$[], reducers: IReducer[]): string {
    const digraph =
      'comment="dispatching effects"\n    ' +
      effects$.filter(({dispatch}) => dispatch)
        .flatMap(({causes, effects}) => causes.map((cause) => {
          return {cause, effects};
        }))
        .flatMap(({cause, effects}) => effects.map((effect) => {
          return {cause, effect};
        }))
        .flatMap(({cause, effect}) => [
          `"${cause}" [id="${cause}" label="${DotFileParser.getLabel(cause)}" fillcolor="#ff4081" fontcolor="#ffffff" tooltip=""]`,
          `"${effect}" [id="${effect}" label="${DotFileParser.getLabel(effect)}" fillcolor="#ff4081" fontcolor="#ffffff" tooltip=""]`,
          `"${cause}" -> "${effect}" [tooltip="Dispatches\\n${effect}"]`])
        .filter((value, index, self) => self.indexOf(value) === index)
        .join("\n    ") +

      '\n\n    comment="non dispatching effects"\n    ' +
      effects$.filter(({dispatch}) => !dispatch)
        .flatMap(({causes, effect$}) => causes
          .map((cause) =>
            `"${cause}" [id="${cause}" label="${DotFileParser.getLabel(cause)}" fillcolor="#ff4081" fontcolor="#ffffff" tooltip=""]\n    ` +
            `"${cause}-${effect$}" [color="invis" label=""]\n    ` +
            `"${cause}" -> "${cause}-${effect$}" [arrowhead="tee" tooltip="Non dispatching effect\\n${effect$}"]`))
        .join("\n    ") +

      '\n\n    comment="catch errors"\n    ' +
      effects$.flatMap(({causes, effect$, errors}) => causes
        .flatMap((cause) => errors.map((error) =>
          `"${cause}-${error}" [id="${cause}-${error}" label="${DotFileParser.getLabel(error)}" fillcolor="#f44336" fontcolor="#ffffff" tooltip="${error}"]\n    ` +
          `"${cause}" -> "${cause}-${error}" [color="#f44336" style="dashed" tooltip="Error caught\\n${effect$}"]`)))
        .join("\n    ") +

      '\n\n    comment="other actions"\n    ' +
      actions.filter((action) => effects$
        .flatMap(({causes}) => causes).every((cause) => action !== cause))
        .filter((action) => effects$.flatMap(({effects}) => effects).every((effect) => action !== effect))
        .map((action) =>
          `"${action}" [id="${action}" label="${DotFileParser.getLabel(action)}" fillcolor="#ff4081" fontcolor="#ffffff" tooltip=""]`)
        .join("\n    ") +

      '\n\n    comment="reducers"\n    ' +
      reducers.map(({reducer, action}) =>
        `"${reducer}-${action}" [label="store" style="" tooltip="store"]\n    ` + // `"${reducer}-${action}" [image="assets/store.svg" label="" style="" tooltip="store"]\n    ` +
        `"${action}" -> "${reducer}-${action}" [tooltip="${reducer}"]`)
        .join("\n    ") +
      "\n";

    return `digraph {
    bgcolor="#fafafa"
    node [shape="polygon" style="filled" fontname="Helvetica"]
    edge [color="#412945", penwidth="2"]
    ${digraph}}`;
  }

  getNavListItemsFromDotSrc(dotSrc: string): INavListItem[] {
    const stmts = parse(dotSrc)
      .flatMap(({children}) => children);
    return this._getNodeStmts(stmts)
      .map((node) => DotFileParser.node2listItem(node))
      .filter(({label}) => !!label)
      .filter(({id}) => !id.includes("-"));
  }

  getNavListItemsFromActions(actions: string[]): INavListItem[] {
    return actions.map((action) => {
      return {
        id: action,
        label: DotFileParser.getListItemLabel(action)
      };
    });
  }

  private _getNodeStmts(stmts: Stmt[]): NodeStmt[] {
    const nodes = stmts.filter(({type}) => type === "node_stmt").map((node) => node as NodeStmt);
    const subNodes = stmts.filter(({type}) => type === "edge_stmt")
      .map((stmt) => stmt as EdgeStmt)
      .flatMap(({edge_list}) => edge_list)
      .filter(({type}) => type === "subgraph")
      .map((subgraph) => subgraph as Subgraph)
      .flatMap(({children}) => this._getNodeStmts(children));

    return [...nodes, ...subNodes];
  }

  private static getLabel(action: string): string {
    return action.replace(/(\[.+]) (.+)/, "$1\\n$2");
  }

  private static getListItemLabel(action: string): string {
    return action.replace(/(\[.+]) (.+)/, "$1<br/>$2");
  }

  private static node2listItem({node_id, attr_list}: NodeStmt): INavListItem {
    return {
      id: node_id.id.toString(),
      label: attr_list.filter(({id}) => id === "label")
        .map(({eq}) => eq.toString())
        .map((label) => label.replace("\\n", "<br/>"))[0]
    };
  }
}

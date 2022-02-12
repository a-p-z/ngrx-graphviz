import {Expression, InMemoryFileSystemHost, Project, SyntaxKind,} from "ts-morph";
import {IEffect$, IReducer, ISourceFile} from "src/app/models";

export class ProjectParser {
  private fileSystem = new InMemoryFileSystemHost();

  createSourceFile(path: string, text: string): ISourceFile {
    this.fileSystem.writeFileSync(path.replace(/^.+?\//, ''), text);
    return {path, text};
  }

  parse(tsConfigFilePath: string): { actions: string[], effects$: IEffect$[], reducers: IReducer[] } {
    const project = new Project({fileSystem: this.fileSystem, tsConfigFilePath: tsConfigFilePath.replace(/^.+\//, '')});
    const actions = ProjectParser.getActions(project);
    const effects$ = ProjectParser.getEffects$(project);
    const reducers = this.getReducers(project);
    this.fileSystem = new InMemoryFileSystemHost();
    return {actions, effects$, reducers};
  }

  private static getActions(project: Project): string[] {
    return project.getSourceFiles()
      .flatMap((sourceFile) => sourceFile.getVariableDeclarations())
      .map((variableDeclaration) => variableDeclaration.getType())
      .filter((type) => type.getText().startsWith('import("/node_modules/@ngrx/store/src/models").ActionCreator'))
      .flatMap((type) => type.getAliasTypeArguments())
      .map((aliasTypeArgument) => aliasTypeArgument.getLiteralValue()?.toString())
      .filter((aliasTypeArgument) => !!aliasTypeArgument) as string[];
  }

  private getReducers(project: Project): IReducer[] {
    return project.getSourceFiles()
      .flatMap((sourceFile) => sourceFile.getVariableDeclarations())
      .filter((variableDeclaration) => variableDeclaration.getType().getText().startsWith('import("/node_modules/@ngrx/store/src/models").ActionReducer'))
      .flatMap((variableDeclaration) => variableDeclaration.getDescendantsOfKind(SyntaxKind.Identifier)
        .map((identifier) => {
          return {reducer: variableDeclaration.getName(), type: identifier.getType()};
        }))
      .filter(({type}) => type.getText().startsWith('import("/node_modules/@ngrx/store/src/models").ActionCreator'))
      .flatMap(({reducer, type}) => type.getAliasTypeArguments()
        .map((aliasTypeArgument) => {
          return {reducer, action: aliasTypeArgument.getLiteralValue()?.toString()};
        }))
      .filter(({action, reducer}) => !!action && !!reducer) as IReducer[];
  }

  private static getEffects$(project: Project): IEffect$[] {
    return project.getSourceFiles()
      .flatMap((sourceFile) => sourceFile.getClasses())
      .flatMap((clazz) => clazz.getProperties())
      .map((property) => {
        return {effect$: property.getName(), initializer: property.getInitializer()};
      })
      .filter(({initializer}) => initializer?.getFirstDescendantByKind(SyntaxKind.Identifier)?.getType().getText() === 'typeof import("/node_modules/@ngrx/effects/src/effect_creator").createEffect')
      .map(({effect$, initializer}) => {
        const expression = initializer as Expression;
        const causes = ProjectParser.getCauses(expression);
        const dispatch = ProjectParser.dispatch(expression);
        const errors = ProjectParser.catchErrors(expression);
        const effects = dispatch ? ProjectParser.getEffects(expression, errors) : [];
        return {causes, dispatch, effect$, effects, errors};
      });
  }

  private static getCauses(expression: Expression): string[] {
    return expression.getDescendantsOfKind(SyntaxKind.Identifier)
      .filter((identifier) => identifier.getType().getText() === 'typeof import("/node_modules/@ngrx/effects/src/actions").ofType')
      .map((identifier) => identifier.getParent())
      .flatMap((parent) => parent.getDescendantsOfKind(SyntaxKind.Identifier))
      .map((identifier) => identifier.getType())
      .map((type) => type.getLiteralValue())
      .map((literalValue) => literalValue?.toString())
      .filter((cause) => !!cause) as string[] || [];
  }

  private static dispatch(expression: Expression): boolean {
    const dispatch = expression.getDescendantsOfKind(SyntaxKind.ObjectLiteralExpression)
      .flatMap((objectLiteralExpression) => objectLiteralExpression.getDescendantsOfKind(SyntaxKind.PropertyAssignment))
      .filter((propertyAssignment) => propertyAssignment.getName() === 'dispatch')
      .map((propertyAssignment) => propertyAssignment?.getInitializer())
      .map((expression) => !expression ? true : !!expression.asKind(SyntaxKind.TrueKeyword))[0];
    return dispatch === undefined ? true : dispatch;
  }

  private static catchErrors(expression: Expression): string[] {
    const catchErrors = expression.getDescendantsOfKind(SyntaxKind.Identifier)
      .filter((identifier) => identifier.getText() === 'catchError')
      .map((identifier) => identifier.getParent()) || [];

    return [...catchErrors
      .flatMap((parent) => parent.getDescendantsOfKind(SyntaxKind.Identifier))
      .map((identifier) => identifier.getType())
      .filter((type) => type.getText().startsWith('import("/node_modules/@ngrx/store/src/models").ActionCreator'))
      .flatMap((type) => type.getAliasTypeArguments())
      .map((aliasTypeArgument) => aliasTypeArgument.getLiteralValue())
      .map((literalValue) => literalValue?.toString())
      .filter((error) => !!error) as string[],
      ...catchErrors.flatMap((expression) => expression.getDescendantsOfKind(SyntaxKind.CallExpression))
        .map((expression) => expression.getReturnType())
        .filter((type) => type.getTargetType()?.getText() === 'import("/node_modules/@ngrx/store/src/models").TypedAction<T>')
        .flatMap((returnType) => returnType.getTypeArguments())
        .flatMap((typeArgument) => typeArgument.getUnionTypes())
        .map((unionType) => unionType.getLiteralValue())
        .map((literalValue) => literalValue?.toString())
        .filter((error) => !!error) as string[]];
  }

  private static getEffects(expression: Expression, errors: string[]): string[] {
    const expressions = expression.getFirstAncestorByKind(SyntaxKind.PropertyDeclaration)
      ?.getDescendantsOfKind(SyntaxKind.CallExpression) || [];

    return [...expressions
      .filter((expression) => expression.getReturnType().getText().includes('import("/node_modules/@ngrx/store/src/models").TypedAction'))
      .flatMap((expression) => expression.getDescendantsOfKind(SyntaxKind.Identifier))
      .map((identifier) => identifier.getType())
      .flatMap((type) => type.getAliasTypeArguments())
      .map((aliasTypeArgument) => aliasTypeArgument.getLiteralValue())
      .map((literalValue) => literalValue?.toString())
      .filter((effect) => !errors.includes(effect as string))
      .filter((effect) => !!effect) as string[],
      ...expressions
        .map((expression) => expression.getReturnType())
        .filter((type) => type.getTargetType()?.getText() === 'import("/node_modules/@ngrx/store/src/models").TypedAction<T>')
        .flatMap((returnType) => returnType.getTypeArguments())
        .flatMap((typeArgument) => typeArgument.getUnionTypes())
        .map((unionType) => unionType.getLiteralValue())
        .map((literalValue) => literalValue?.toString())
        .filter((effect) => !errors.includes(effect as string))
        .filter((effect) => !!effect) as string[]];
  }
}

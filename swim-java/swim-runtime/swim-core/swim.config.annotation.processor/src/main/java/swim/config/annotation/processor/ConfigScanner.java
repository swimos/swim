package swim.config.annotation.processor;

import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.Modifier;
import com.github.javaparser.ast.body.ClassOrInterfaceDeclaration;
import com.github.javaparser.ast.body.FieldDeclaration;
import com.github.javaparser.ast.body.MethodDeclaration;
import com.github.javaparser.ast.body.VariableDeclarator;
import com.github.javaparser.ast.expr.AssignExpr;
import com.github.javaparser.ast.expr.ClassExpr;
import com.github.javaparser.ast.expr.FieldAccessExpr;
import com.github.javaparser.ast.expr.MethodCallExpr;
import com.github.javaparser.ast.expr.Name;
import com.github.javaparser.ast.expr.NameExpr;
import com.github.javaparser.ast.expr.ObjectCreationExpr;
import com.github.javaparser.ast.expr.StringLiteralExpr;
import com.github.javaparser.ast.expr.SuperExpr;
import com.github.javaparser.ast.expr.ThisExpr;
import com.github.javaparser.ast.expr.TypeExpr;
import com.github.javaparser.ast.expr.UnaryExpr;
import com.github.javaparser.ast.expr.VariableDeclarationExpr;
import com.github.javaparser.ast.stmt.BlockStmt;
import com.github.javaparser.ast.stmt.IfStmt;
import com.github.javaparser.ast.stmt.ReturnStmt;
import com.github.javaparser.ast.stmt.ThrowStmt;
import com.github.javaparser.ast.type.ClassOrInterfaceType;
import com.github.javaparser.ast.type.Type;
import com.github.javaparser.javadoc.Javadoc;
import com.sun.source.util.DocTrees;
import swim.codec.Debug;
import swim.codec.DebugFormatter;
import swim.codec.Output;
import swim.config.AbstractConfigurable;
import swim.config.ConfigError;
import swim.config.ConfigException;
import swim.config.Configurable;
import swim.config.Ignore;
import swim.config.model.ConfigurationElement;
import swim.config.model.ConfigurationItemElement;
import swim.config.validator.ValidatorImplementation;
import swim.structure.Form;
import swim.structure.Tag;
import swim.structure.Value;

import javax.annotation.processing.Messager;
import javax.annotation.processing.ProcessingEnvironment;
import javax.lang.model.element.AnnotationMirror;
import javax.lang.model.element.ElementKind;
import javax.lang.model.element.ExecutableElement;
import javax.lang.model.element.PackageElement;
import javax.lang.model.element.TypeElement;
import javax.lang.model.type.TypeMirror;
import javax.lang.model.util.ElementScanner9;
import javax.tools.Diagnostic;
import javax.tools.JavaFileObject;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

class ConfigScanner extends ElementScanner9<Void, Void> {
  final Messager messager;
  final ProcessingEnvironment processingEnv;

  final DocTrees docTrees;
  final Map<TypeElement, ConfigurationElement> configurations;

  ConfigScanner(ProcessingEnvironment processingEnv, Map<TypeElement, ConfigurationElement> configurations) {
    this.processingEnv = processingEnv;
    this.messager = processingEnv.getMessager();
    this.configurations = configurations;

    this.docTrees = DocTrees.instance(this.processingEnv);
  }

  CompilationUnit compilationUnit;
  ClassOrInterfaceDeclaration configImplementation;
  ClassOrInterfaceType configImplementationType;
  ClassOrInterfaceType interfaceType;

  MethodDeclaration debugMethod;
  MethodDeclaration validateMethod;
  MethodDeclaration configureMethod;

  BlockStmt debugBody;
  BlockStmt configureBody;
  BlockStmt validateBody;

  Map<Class<?>, NameExpr> validatorAttributeToNameLookup = new HashMap<>();

  void addLoadMethod(TypeElement e) {
    MethodDeclaration loadMethod = this.configImplementation.addMethod("load", Modifier.Keyword.PUBLIC, Modifier.Keyword.STATIC);
    loadMethod.addAndGetParameter("Value", "value");
    loadMethod.setType(this.interfaceType);

    NameExpr varValue = new NameExpr("value");
    NameExpr varResult = new NameExpr("result");
    BlockStmt body = new BlockStmt();
    loadMethod.setBody(body);

    VariableDeclarationExpr expr = new VariableDeclarationExpr(
        new VariableDeclarator(
            this.interfaceType,
            varResult.getNameAsString(),
            new MethodCallExpr(
                new FieldAccessExpr(
                    new TypeExpr(this.configImplementationType),
                    "FORM"
                )
                , "cast")
                .addArgument(varValue)
        )
    );
    body.addStatement(expr);
    body.addStatement(
        new MethodCallExpr(
            varResult,
            "configure"
        ).addArgument(varValue)
    );

    body.addStatement(new ReturnStmt(varResult));
  }


  void beginValidate() {
    this.validateBody = new BlockStmt();
    this.validateMethod = this.configImplementation.addMethod("validate")
        .setPublic(true)
        .setBody(this.validateBody)
        .addThrownException(ConfigException.class)
        .addAnnotation("Override");
    this.validateMethod.setJavadocComment("Method is used to validate the supplied configuration.");
//    this.validateMethod.addAndGetParameter("List<ConfigError>", "errors");
    Type listType = StaticJavaParser.parseType("List");
    VariableDeclarationExpr expr = new VariableDeclarationExpr(
        new VariableDeclarator(
            listType,
            "errors",
            new ObjectCreationExpr().setType(ArrayList.class)
        )
    );
    this.validateBody.addStatement(expr);


  }

  void beginDebug(TypeElement e) {
    this.debugMethod = this.configImplementation.addMethod("debug")
        .setPublic(true)
        .addAnnotation("Override");
    Type type = StaticJavaParser.parseType("Output<T>");
    this.debugMethod.addAndGetParameter(type, "output");
    this.debugMethod.setType(type);
    this.debugMethod.addTypeParameter("T");

    this.debugBody = new BlockStmt();
    this.debugMethod.setBody(this.debugBody);
    Type typeDebugFormatter = StaticJavaParser.parseType("DebugFormatter");
    VariableDeclarationExpr expr = new VariableDeclarationExpr(
        new VariableDeclarator(
            typeDebugFormatter,
            "formatter",
            new MethodCallExpr(new TypeExpr(typeDebugFormatter), "of")
                .addArgument(StaticJavaParser.parseExpression(e.getSimpleName() + ".class"))
        )
    );
    this.debugBody.addStatement(expr);
  }

  void finishValidate() {
//      Statement statement = StaticJavaParser.parseStatement("throw new ConfigException(errors);");

    NameExpr errors = new NameExpr("errors");

    IfStmt ifStmt = new IfStmt();
    ifStmt.setCondition(
        new UnaryExpr(
            new MethodCallExpr(
                errors,
                "isEmpty"
            ),
            UnaryExpr.Operator.LOGICAL_COMPLEMENT
        )
    );

    BlockStmt blockStmt = new BlockStmt();
    ifStmt.setThenStmt(blockStmt);
    ObjectCreationExpr objectCreationExpr = new ObjectCreationExpr();
    objectCreationExpr.setType(ConfigException.class);
    objectCreationExpr.addArgument(errors);
    blockStmt.addStatement(
        new ThrowStmt(objectCreationExpr)
    );
    this.validateBody.addStatement(ifStmt);
  }

  void finishDebug() {
    this.debugBody.addStatement(
        new ReturnStmt(
            new MethodCallExpr(
                new NameExpr("formatter"),
                "to"
            ).addArgument("output")
        )
    );
  }

  void beginConfigure() {
    this.configureBody = new BlockStmt();
    this.configureMethod = this.configImplementation.addMethod("configure")
        .setPublic(true)
        .setBody(this.configureBody)
        .addAnnotation("Override");
    this.configureMethod.addAndGetParameter("Value", "value");
  }

  ConfigurationElement configuration;

  @Override
  public Void visitType(TypeElement e, Void unused) {
    if (ElementKind.INTERFACE != e.getKind()) {
      this.messager.printMessage(Diagnostic.Kind.ERROR, "Only interfaces are supported.", e);
      return null;
    }

    this.configuration = new ConfigurationElement();
    this.configurations.put(e, this.configuration);
    PackageElement packageElement = this.processingEnv.getElementUtils().getPackageOf(e);

    this.validatorAttributeToNameLookup = new HashMap<>();

    this.compilationUnit = new CompilationUnit(packageElement.getQualifiedName().toString())
        .addImport(Debug.class)
        .addImport(Configurable.class)
        .addImport(Value.class)
        .addImport(Output.class)
        .addImport(List.class)
        .addImport(ArrayList.class)
        .addImport(ConfigError.class)
        .addImport(Form.class)
        .addImport(AbstractConfigurable.class)
        .addImport(ConfigException.class)
        .addImport(DebugFormatter.class);
    String className = e.getSimpleName().toString() + "Impl";

    this.interfaceType = new ClassOrInterfaceType(e.getSimpleName().toString());

    this.configImplementation = this.compilationUnit
        .addClass(className)
        .setPublic(true)
        .addExtendedType(AbstractConfigurable.class.getSimpleName())
        .addImplementedType(e.getSimpleName().toString());
    this.configImplementationType = new ClassOrInterfaceType(this.configImplementation.getNameAsString());

    Tag tag = e.getAnnotation(Tag.class);
    if (null != tag) {
      this.configImplementation.addAndGetAnnotation(Tag.class)
          .addPair("value", new StringLiteralExpr(tag.value()));
    }

    beginDebug(e);
    beginValidate();
    beginConfigure();

    Type formVariableType = new ClassOrInterfaceType("Form")
        .setTypeArguments(this.configImplementationType);
    Type formType = new ClassOrInterfaceType("Form");
    FieldDeclaration formField = this.configImplementation.addFieldWithInitializer(
        formVariableType,
        "FORM",
        new MethodCallExpr(
            new TypeExpr(formType),
            "forClass"
        ).addArgument(new ClassExpr(this.configImplementationType)),
        Modifier.Keyword.PUBLIC, Modifier.Keyword.STATIC, Modifier.Keyword.FINAL);

    addLoadMethod(e);


    Void visitResults = super.visitType(e, unused);

    finishDebug();
    finishValidate();


    try {
      String parentPath = packageElement.getQualifiedName().toString();
      this.messager.printMessage(Diagnostic.Kind.OTHER, "Creating " + className, e);
      String fullName = String.format("%s.%s", packageElement.getQualifiedName(), className);
      JavaFileObject implementation = processingEnv.getFiler().createSourceFile(fullName, e);

      try (Writer writer = new OutputStreamWriter(implementation.openOutputStream())) {
        writer.write(this.compilationUnit.toString());
      }


    } catch (IOException ex) {
      throw new RuntimeException(ex); //TODO fix this.
    }


    return visitResults;
  }


  IfStmt addIfValueDoesNotContain(BlockStmt methodBody, String name) {
    IfStmt result = new IfStmt()
        .setCondition(
            new UnaryExpr(
                new MethodCallExpr(
                    new NameExpr("value"),
                    "containsKey"
                ).addArgument(new StringLiteralExpr(name)), //TODO: This needs to support key.
                UnaryExpr.Operator.LOGICAL_COMPLEMENT
            )
        );
    methodBody.addStatement(result);
    return result;
  }


  @Override
  public Void visitExecutable(ExecutableElement e, Void unused) {
    Ignore ignore = e.getAnnotation(Ignore.class);
    if (e.isDefault() && null != ignore) {
      this.messager.printMessage(Diagnostic.Kind.OTHER, "Ignoring", e);
      return null;
    }

    Type type = StaticJavaParser.parseType(e.getReturnType().toString());
    ConfigurationItemElement configItem = new ConfigurationItemElement();
    configItem.type(type.asString());
    this.configuration.configurationItems().add(configItem);
    configItem.name(e.getSimpleName().toString());
    FieldDeclaration field = this.configImplementation.addField(type, e.getSimpleName().toString(), Modifier.Keyword.PROTECTED);
    MethodDeclaration method = this.configImplementation.addMethod(e.getSimpleName().toString(), Modifier.Keyword.PUBLIC);
    String comments = processingEnv.getElementUtils().getDocComment(e);
    if (null != comments && !comments.isEmpty()) {
      Javadoc javadoc = StaticJavaParser.parseJavadoc(comments);
      field.setJavadocComment(javadoc.toComment());
      method.setJavadocComment(javadoc.toComment());
      configItem.documentation(javadoc.getDescription().toText());
    } else {
      this.messager.printMessage(Diagnostic.Kind.MANDATORY_WARNING, "Configuration method has no comments. Documentation will be missing.", e);
    }


    method.setType(field.getElementType());
    BlockStmt blockStmt = new BlockStmt();
    blockStmt.addStatement(
        new ReturnStmt(
            new FieldAccessExpr(new ThisExpr(), e.getSimpleName().toString())
        )
    );
    method.setBody(blockStmt);

    this.debugBody.addStatement(
        new MethodCallExpr(
            new NameExpr("formatter"),
            "add"
        )
            .addArgument(new StringLiteralExpr(e.getSimpleName().toString()))
            .addArgument(new FieldAccessExpr(new ThisExpr(), e.getSimpleName().toString()))
    );


    for (AnnotationMirror annotationMirror : e.getAnnotationMirrors()) {
      TypeMirror typeMirror = annotationMirror.getAnnotationType().asElement().asType();
      Class attributeClass;
      try {
        attributeClass = Class.forName(typeMirror.toString());
      } catch (ClassNotFoundException ex) {
        throw new RuntimeException(ex);
      }

      NameExpr validatorName = this.validatorAttributeToNameLookup.computeIfAbsent(attributeClass, a -> {
        ValidatorImplementation validator = (ValidatorImplementation) attributeClass.getAnnotation(ValidatorImplementation.class);
        Class<?> enclosingClass = validator.value().getEnclosingClass();

        ClassOrInterfaceType validatorType;
        if (null != enclosingClass) {
          this.compilationUnit.addImport(enclosingClass);
          validatorType = new ClassOrInterfaceType(
              String.format("%s.%s", enclosingClass.getSimpleName(), validator.value().getSimpleName())
          );
        } else {
          this.compilationUnit.addImport(validator.value());
          validatorType = new ClassOrInterfaceType(validator.value().getSimpleName());
        }

        String variableName = Character.toLowerCase(attributeClass.getSimpleName().charAt(0)) + attributeClass.getSimpleName().substring(1) + "Validator";
        VariableDeclarationExpr varValidator = new VariableDeclarationExpr(
            new VariableDeclarator(
                validatorType,
                variableName,
                new ObjectCreationExpr()
                    .setType(validatorType)
            )
        );
        this.validateBody.addStatement(varValidator);
        return new NameExpr(variableName);
      });
      ClassOrInterfaceType attributeType = new ClassOrInterfaceType(attributeClass.getSimpleName());

      String attributeVariableName = String.format("%s%s", e.getSimpleName(), attributeClass.getSimpleName());

      VariableDeclarationExpr varAttribute = new VariableDeclarationExpr(
          new VariableDeclarator(
              attributeType,
              attributeVariableName,
              new MethodCallExpr("attribute")
                  .addArgument(new ClassExpr(this.interfaceType))
                  .addArgument(new StringLiteralExpr(e.getSimpleName().toString()))
                  .addArgument(new ClassExpr(attributeType))
          )
      );
      NameExpr attributeNameExpr = new NameExpr(attributeVariableName);
      this.validateBody.addStatement(varAttribute);
      this.validateBody.addStatement(
          new MethodCallExpr(
              validatorName,
              "validate"
          ).addArgument(new NameExpr("errors"))
              .addArgument(attributeNameExpr)
              .addArgument(new StringLiteralExpr(e.getSimpleName().toString()))
              .addArgument(new FieldAccessExpr(new ThisExpr(), e.getSimpleName().toString()))
      );


    }


    if (e.isDefault()) {
      IfStmt ifDoesNotContain = addIfValueDoesNotContain(this.configureBody, e.getSimpleName().toString());
      BlockStmt setDefaultValue = new BlockStmt();
      ifDoesNotContain.setThenStmt(setDefaultValue);

      setDefaultValue.addStatement(
          new AssignExpr()
              .setTarget(new FieldAccessExpr(new ThisExpr(), e.getSimpleName().toString()))
              .setValue(
                  new MethodCallExpr(
                      new SuperExpr(
                          new Name(e.getEnclosingElement().getSimpleName().toString())
                      ),
                      e.getSimpleName().toString()
                  )
              )
      );
    }


    return null;
  }


}

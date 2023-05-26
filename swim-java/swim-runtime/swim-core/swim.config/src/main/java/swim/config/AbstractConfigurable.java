package swim.config;

import java.lang.annotation.Annotation;
import java.lang.reflect.Method;

public class AbstractConfigurable {

  protected <T extends Annotation> T attribute(Class<?> interfaceClass, String methodName, Class<T> attributeClass) {
    try {
      Method method = interfaceClass.getMethod(methodName);
      return method.getDeclaredAnnotation(attributeClass);
    } catch (NoSuchMethodException e) {
      throw new RuntimeException(e);
    }

  }

}

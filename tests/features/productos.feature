Feature: Gestión de productos en el sistema

  Background:
    Given el usuario abre la página de login

  Scenario: Usuario registrado consulta productos
    When el usuario ingresa credenciales válidas
    And navega a la lista de productos
    Then debería ver la tabla de productos

  Scenario: Usuario registrado crea un nuevo producto Iphone 16
    When el usuario inicia sesión con credenciales válidas
    And navega a la lista de productos
    And crea un nuevo producto con nombre "Iphone 16"
    Then debería ver el producto "Iphone 16" en la tabla

  Scenario: Usuario registrado actualiza producto a Iphone 16 Pro Max
    When el usuario inicia sesión con credenciales válidas
    And navega a la lista de productos
    And edita el producto "Iphone 16" y cambia su nombre a "Iphone 16 Pro Max"
    Then debería ver el producto actualizado "Iphone 16 Pro Max" en la tabla

  Scenario: Usuario registrado elimina producto Iphone 16 Pro Max
    When el usuario inicia sesión con credenciales válidas
    And navega a la lista de productos
    And elimina el producto "Iphone 16 Pro Max"
    Then el producto "Iphone 16 Pro Max" ya no debería aparecer en la tabla

  Scenario: Usuario no registrado intenta acceder
    Given el usuario no ha iniciado sesión
    When navega directamente a la lista de productos
    Then debería ser redirigido a la página de login
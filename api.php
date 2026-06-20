<?php
session_start();
$data = json_decode(file_get_contents("php://input"), true);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
   exit(0);
}

require_once 'conexion.php';
require_once 'modelo_cliente.php';

$modelo = new ModeloCliente($conn);
$metodoHttp = $_SERVER['REQUEST_METHOD'];

switch($metodoHttp) {
   case 'GET':
       if (isset($_GET['recurso'])) {
           if ($_GET['recurso'] === 'clases') {
               echo json_encode($modelo->obtenerClases());
           }
           elseif ($_GET['recurso'] === 'opiniones') {
               echo json_encode($modelo->obtenerOpiniones());
           }
           elseif ($_GET['recurso'] === 'pagos' && isset($_GET['id_cliente'])) {
               echo json_encode($modelo->obtenerPagosPorCliente($_GET['id_cliente']));
           }
           elseif ($_GET['recurso'] === 'sesion') {
               if (isset($_SESSION['usuario_id'])) {
                   echo json_encode(["logueado" => true, "id" => $_SESSION['usuario_id'], "nombre" => $_SESSION['nombre'], "rol" => $_SESSION['rol']]);
               } else {
                   echo json_encode(["logueado" => false]);
               }
           }
       } else {
           echo json_encode($modelo->obtenerTodos());
       }
       break;

   case 'POST':
       $datos = json_decode(file_get_contents("php://input"), true);
       if (!$datos) {
          echo json_encode(["status" => "error", "message" => "JSON vacío"]);
           exit;
       }

       if (isset($datos['accion']) && $datos['accion'] === 'login') {
           $usuario = $modelo->verificarCredenciales($datos['correo'], $datos['password']);
           if ($usuario) {
               $_SESSION['usuario_id'] = $usuario['id_cliente'];
               $_SESSION['nombre'] = $usuario['nombre_cliente'];
               $_SESSION['rol'] = $usuario['rol'];
               echo json_encode(["status" => "success", "rol" => $usuario['rol']]);
           } else {
               echo json_encode(["status" => "error", "message" => "Credenciales inválidas"]);
           }
       }
       elseif (isset($datos['accion']) && $datos['accion'] === 'guardar_opinion') {
           $exito = $modelo->guardarOpinion($datos['nombre_autor'], $datos['comentario']);
           echo json_encode(["status" => $exito ? "success" : "error"]);
       }
       elseif (isset($datos['accion']) && $datos['accion'] === 'reservar') {
           echo json_encode(["status" => $modelo->reservarClase($datos['id_cliente'], $datos['id_clase']) ? "success" : "error"]);

       }
       elseif (isset($datos['accion']) && $datos['accion'] === 'editar') {

    $editado = $modelo->editar(
        $datos['id_cliente'],
        $datos['nombre'],
        $datos['correo'],
        $datos['password'],
        $datos['id_plan']
    );

    echo json_encode([
        "status" => $editado ? "success" : "error"
    ]);
}
       else {
       // var_dump($datos);
           $registrado = $modelo->registrar($datos['nombre'], $datos['correo'], $datos['password'], $datos['id_plan']);
           echo json_encode(["status" => $registrado ? "success" : "error"]);
       }
       break;

   case 'DELETE':
       $datos = json_decode(file_get_contents("php://input"), true);
       echo json_encode(["status" => $modelo->eliminar($datos['id_cliente']) ? "success" : "error"]);
       break;
}
?>
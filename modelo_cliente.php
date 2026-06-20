<?php
class ModeloCliente {
   private $db;

   public function __construct($conexion) {
       $this->db = $conexion;
   }

   public function verificarCredenciales($correo, $password) {
       $stmt = $this->db->prepare("SELECT id_cliente, nombre_cliente, correo, password, rol FROM cliente WHERE correo = ?");
       $stmt->bind_param("s", $correo);
       $stmt->execute();
       $resultado = $stmt->get_result();
       
       if ($resultado->num_rows === 1) {
           $usuario = $resultado->fetch_assoc();
           if ($password === $usuario['password']) {
               return $usuario;
           }
       }
       return false;
   }

   public function registrar($nombre, $correo, $password, $id_plan) {
       $rol = "usuario";
       $stmt = $this->db->prepare("INSERT INTO cliente (nombre_cliente, correo, password, rol, id_plan) VALUES (?, ?, ?, ?, ?)");
       $stmt->bind_param("ssssi", $nombre, $correo, $password, $rol, $id_plan);
       return $stmt->execute();
   }

   public function obtenerTodos() {
       $resultado = $this->db->query("SELECT id_cliente, nombre_cliente, correo, id_plan FROM cliente WHERE rol = 'usuario'");
       return $resultado->fetch_all(MYSQLI_ASSOC);
   }

   public function eliminar($id_cliente) {
       $stmt = $this->db->prepare("DELETE FROM cliente WHERE id_cliente = ?");
       $stmt->bind_param("i", $id_cliente);
       return $stmt->execute();
   }

   public function obtenerClases() {
       $resultado = $this->db->query("SELECT id_clase, nombre_clase, horario, nombre_entrenador FROM clase");
       return $resultado->fetch_all(MYSQLI_ASSOC);
   }

   public function obtenerPagosPorCliente($id_cliente) {
       $stmt = $this->db->prepare("SELECT monto, fecha_pago FROM pago WHERE id_cliente = ? ORDER BY fecha_pago DESC");
       $stmt->bind_param("i", $id_cliente);
       $stmt->execute();
       return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
   }

   public function reservarClase($id_cliente, $id_clase) {
       return true;
   }

   public function obtenerOpiniones() {
       $resultado = $this->db->query("SELECT nombre_autor, comentario, fecha_publicacion FROM opinion ORDER BY fecha_publicacion DESC");
       return $resultado->fetch_all(MYSQLI_ASSOC);
   }

   public function guardarOpinion($autor, $comentario) {
       $stmt = $this->db->prepare("INSERT INTO opinion (nombre_autor, comentario) VALUES (?, ?)");
       $stmt->bind_param("ss", $autor, $comentario);
       return $stmt->execute();
   }
   public function editar($id_cliente, $nombre, $correo, $password, $id_plan) {
    $stmt = $this->db->prepare(" UPDATE cliente
        SET nombre_cliente = ?, correo = ?, password = ?, id_plan = ?
        WHERE id_cliente = ?");

    $stmt->bind_param("sssii", $nombre, $correo, $password, $id_plan, $id_cliente);

    return $stmt->execute();
}
}
?>
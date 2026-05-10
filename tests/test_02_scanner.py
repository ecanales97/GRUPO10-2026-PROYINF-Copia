import unittest
import requests
import os

class TestDocumentsEndpoint(unittest.TestCase):
    # Asumiendo que tu router está montado en /api/documents en index.js
    BASE_URL = "http://localhost:5000/api/documents"
    
    @classmethod
    def setUpClass(cls):
        """
        PREPARE TEST DATA
        Se ejecuta UNA VEZ antes de todas las pruebas.
        """
        print("\n[PREPARANDO DATOS] Configurando imágenes de prueba...")
        
        # ATENCIÓN: Para que Gemini no lance un error 500, necesitas una imagen 
        # real (aunque sea sacada de Google) de un carnet para el test 1.
        # Coloca una imagen llamada 'carnet_real_test.jpg' en la carpeta tests/
        cls.valid_image_path = "tests/carnet_real_test.jpg" 
        cls.dummy_image_path = "tests/dummy.jpg"

        # Creamos una imagen dummy solo para el test de error (el test 2 no llega a Gemini)
        if not os.path.exists("tests"):
            os.makedirs("tests")
        with open(cls.dummy_image_path, 'wb') as f:
            f.write(b"falso contenido")

    @classmethod
    def tearDownClass(cls):
        """
        Limpieza después de que terminan las pruebas.
        """
        print("\n[LIMPIANDO DATOS] Eliminando imagen dummy...")
        if os.path.exists(cls.dummy_image_path):
            os.remove(cls.dummy_image_path)
            
    def test_01_extract_data_from_valid_carnet(self):
        """
        CP-16-01: Verifica que un carnet válido devuelva la estructura JSON correcta 
        definida en MODOS_CONFIG['carnet'].
        """
        url = f"{self.BASE_URL}/carnet"
        
        # Verificamos que hayas puesto la imagen real de prueba
        if not os.path.exists(self.valid_image_path):
            self.skipTest(f"Falta la imagen {self.valid_image_path} para probar con Gemini real.")

        with open(self.valid_image_path, 'rb') as img:
            # Tu backend espera upload.single("file")
            files = {'file': ('carnet.jpg', img, 'image/jpeg')}
            response = requests.post(url, files=files)

        # Verificamos que responda 200 OK
        self.assertEqual(response.status_code, 200, f"Error del server: {response.text}")
        
        data = response.json()
        
        # Verificamos que Gemini haya devuelto las llaves de tu prompt
        self.assertIn("run", data, "Falta el campo 'run'")
        self.assertIn("nombres", data, "Falta el campo 'nombres'")
        self.assertIn("serie", data, "Falta el campo 'serie'")
        self.assertIn("vencimiento", data, "Falta el campo 'vencimiento'")
        
        print("-> CP-16-01 Pasó exitosamente.")

    def test_02_invalid_document_type(self):
        """
        CP-16-02: Verifica que enviar un documentType que no está en MODOS_CONFIG 
        devuelva error 400 con el mensaje específico.
        """
        url = f"{self.BASE_URL}/pasaporte_inventado" 
        
        with open(self.dummy_image_path, 'rb') as img:
            files = {'file': ('dummy.jpg', img, 'image/jpeg')}
            response = requests.post(url, files=files)

        # Tu controlador dice: if (!config) return res.status(400)
        self.assertEqual(response.status_code, 400, "Debería retornar 400 Bad Request")
        
        data = response.json()
        
        # Tu controlador dice: res.status(400).json({ error: "Invalid document type" })
        self.assertEqual(data.get("error"), "Invalid document type", "El mensaje de error no coincide")
        
        print("-> CP-16-02 Pasó exitosamente.")

if __name__ == '__main__':
    unittest.main()
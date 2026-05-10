import unittest
import requests

from datetime import datetime, timedelta

BASE_API = "http://localhost:5000/api/credits"
FIRST_PAYMENT_DATE = (datetime.today() + timedelta(days=45)).strftime("%Y-%m-%d")

# LAS PRUEBAS SE BASAN EN LA SIMULACION
# DEL CREDITO DE CONSUMO
# NOTAR QUE LOS SEGUROS AUN NO ESTAN
# IMPLEMENTADOS, POR LO QUE SE
# CONSIDERARAN PARA ESTAS PRUEBAS !!!!
# CUANDO ESTEN SI SE METERAN XD
class TestSimulation(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        print("PREPARANDO DATOS DE PRUEBA PARA SIMULACIONES DE CREDITO DE CONSUMO")

        config_response = requests.get(f"{BASE_API}/consumption")

        if config_response.status_code != 200:
            raise Exception(
                "NO SE PUDO OBTENER CONFIG DE CREDITOS"
            )
        params = config_response.json()["data"]["parameters"]

        # LIMITS
        cls.min_term = params["term"]["min"]
        cls.max_term = params["term"]["max"]

        cls.min_amount = params["amount"]["min"]
        cls.max_amount = params["amount"]["max"]

        # DATA
        cls.base_data = {
            "nationalId": "12.345.678-9",
            "useSimplePersonalInformation": True,
            "income": 600_000,
            "amount": 1_500_000,
            "termMonthly": 12,
            "firstPaymentDate": FIRST_PAYMENT_DATE
        }

        print("DATOS LISTOS\n")

    @classmethod
    def tearDownClass(cls):
        print("\nFIN DE LAS PRUEBAS")

    def getApiUrl(self, creditType):
        return f"{BASE_API}/{creditType}/simulation"

    # TEST PARA UNA SIMULACIONES VALIDAS,
    # VALIDA QUE TODOS SUS OPTIONS ESTEN
    # CORRECTOS TAMBIEN Y EN LOS RANGOS
    # QUE DEBERIAN ESTAR
    def test_valid_consumption_simulations(self):
        valid_cases = [
            {
                "name": "base_case",
                "data": self.base_data
            },{
                "name": "min_term",
                "data": {
                    **self.base_data,
                    "termMonthly": self.min_term
                }
            },{
                "name": "max_term",
                "data": {
                    **self.base_data,
                    "termMonthly": self.max_term
                }
            },{
                "name": "min_amount",
                "data": {
                    **self.base_data,
                    "amount": self.min_amount
                }
            },{
                "name": "max_amount",
                "data": {
                    **self.base_data,
                    "amount": self.max_amount
                }
            },{
                "name": "max_amount_max_term",
                "data": {
                    **self.base_data,
                    "amount": self.max_amount,
                    "termMonthly": self.max_term
                }
            },{
                "name": "min_amount_min_term",
                "data": {
                    **self.base_data,
                    "amount": self.min_amount,
                    "termMonthly": self.min_term
                }
            },{
                "name": "max_amount_min_term",
                "data": {
                    **self.base_data,
                    "amount": self.max_amount,
                    "termMonthly": self.min_term
                }
            },{
                "name": "min_amount_max_term",
                "data": {
                    **self.base_data,
                    "amount": self.min_amount,
                    "termMonthly": self.max_term
                }
            },
        ]

        for case in valid_cases:
            with self.subTest(case=case["name"]):
                response = requests.post(self.getApiUrl("consumption"), json=case["data"])
                self.assertEqual(response.status_code, 200)

                body = response.json()
                self.assertIn("options", body)

                options = body["options"]
                self.assertIsInstance(options, list)
                self.assertGreater(len(options), 0)

                for option in options:
                    # KEYS
                    required_keys = [
                        "type",
                        "amount",
                        "termMonthly",
                        "monthlyInstallment",
                        "monthlyRate",
                        "annualRate",
                        "apr",
                        "tcc"
                    ]
                    for key in required_keys:
                        self.assertIn(key, option)
                    
                    # TYPE
                    self.assertEqual(option["type"], "consumption")

                    # AMOUNT
                    self.assertGreaterEqual(option["amount"], self.min_amount)
                    self.assertLessEqual(option["amount"], self.max_amount)

                    # TERM
                    self.assertGreaterEqual(option["termMonthly"], self.min_term)
                    self.assertLessEqual(option["termMonthly"], self.max_term)

                    # INSTALLMENT
                    self.assertGreater(option["monthlyInstallment"], 0)

                    # RATES
                    self.assertGreaterEqual(float(option["monthlyRate"]), 0)
                    self.assertLessEqual(float(option["monthlyRate"]), 100)

                    self.assertGreaterEqual(float(option["annualRate"]), 0)
                    self.assertLessEqual(float(option["annualRate"]), 100)

                    self.assertGreaterEqual(option["apr"], 0)
                    self.assertLessEqual(option["apr"], 100)

                    # TCC
                    estimated_tcc = option["monthlyInstallment"] * option["termMonthly"]
                    self.assertAlmostEqual(option["tcc"], estimated_tcc, delta=1000)

    # TEST PARA VALIDAR CIERTOS CASOS
    # QUE NO DEBERIAN OCURRIR, COMO
    # UN TIPO DE CREDITO NO VALIDO,
    # Y CUATRO CASOS DONDE SE DAN
    # VALORES FUERA DEL RANGO
    # ESPERADO (LAS CUOTAS Y EL
    # MONTO DEL CREDITO)
    def test_invalid_consumption_simulations(self):
        invalid_cases = [
            {
                "name": "invalid_credit_type",
                "credit_type": "GRANDE_YE_AKA_KANYE_WEST",
                "data": self.base_data,
                "expected_status": 400
            },{
                "name": "term_above_max",
                "credit_type": "consumption",
                "data": {
                    **self.base_data,
                    "termMonthly": self.max_term + 1
                },
                "expected_status": 400
            },{
                "name": "term_below_min",
                "credit_type": "consumption",
                "data": {
                    **self.base_data,
                    "termMonthly": self.min_term - 1
                },
                "expected_status": 400
            },{
                "name": "amount_above_max",
                "credit_type": "consumption",
                "data": {
                    **self.base_data,
                    "amount": self.max_amount + 1
                },
                "expected_status": 400
            },{
                "name": "amount_below_min",
                "credit_type": "consumption",
                "data": {
                    **self.base_data,
                    "amount": self.min_amount - 1
                },
                "expected_status": 400
            },
        ]

        for case in invalid_cases:
            with self.subTest(case=case["name"]):
                response = requests.post(
                    self.getApiUrl(case["credit_type"]),
                    json=case["data"]
                )
                self.assertEqual(
                    response.status_code,
                    case["expected_status"]
                )

                body = response.json()
                self.assertIn("error", body)

if __name__ == "__main__":
    unittest.main()
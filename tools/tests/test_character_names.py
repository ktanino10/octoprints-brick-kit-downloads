from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from localize_pages import Renderer, character_display_text


class CharacterDisplayNameTests(unittest.TestCase):
    def test_correct_name_is_idempotent_and_machine_tokens_are_preserved(self):
        for source in ["Ducky", "DUCKY", "Rubber Ducky", "RUBBER DUCKY"]:
            self.assertEqual(character_display_text(source), "Rubber Ducky")
            self.assertEqual(character_display_text(character_display_text(source)), "Rubber Ducky")
        for source in ["ducky", "ducky-p120", "DUCKY-P120-001", "Ducky.FCStd",
                       "artifacts/Ducky/manifest.json", "https://example.com/Ducky", "case=Ducky"]:
            self.assertEqual(character_display_text(source), source)

    def test_rendering_changes_only_visible_name_and_accessible_labels_not_urls_or_code(self):
        renderer = Renderer("home", "en", "en/index.html", {})
        renderer.feed('<html><head><title>Ducky</title><meta name="description" content="Ducky model"></head>'
                      '<body><a href="density-guide.html?case=ducky-p120">Ducky</a>'
                      '<img src="assets/ducky.jpg" alt="Ducky / DUCKY-P120-001">'
                      '<code>Ducky.FCStd / DUCKY-P120-001</code></body></html>')
        output = "".join(renderer.result)
        self.assertIn("<title>Rubber Ducky</title>", output)
        self.assertIn('content="Rubber Ducky model"', output)
        self.assertIn('case=ducky-p120">Rubber Ducky</a>', output)
        self.assertIn('src="../assets/ducky.jpg" alt="Rubber Ducky / DUCKY-P120-001"', output)
        self.assertIn("<code>Ducky.FCStd / DUCKY-P120-001</code>", output)


if __name__ == "__main__":
    unittest.main()

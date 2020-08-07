import unittest

import mutations_extractor


class MutationsExtractorTest(unittest.TestCase):

    def test_xml_lines_parsing(self):
        s = '<article-title> The Spike D614G mutation increases SARS-CoV-2 infection of multiple </article-title>'
        mutations_extractor.process_article_lines([s], mutations_extractor.EXT_XML, verbose=True)

        s = 'D614G  223322A>T  42A&gt;G'
        mutations_extractor.process_article_lines([s], mutations_extractor.EXT_XML, verbose=True)


if __name__ == '__main__':
    unittest.main()

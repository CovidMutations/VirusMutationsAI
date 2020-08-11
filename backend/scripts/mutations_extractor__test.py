import pandas as pd
import unittest

import mutations_extractor as me


class MutationsExtractorTest(unittest.TestCase):

    def test_xml_lines_parsing(self):
        s = '<article-title> The Spike D614G mutation increases SARS-CoV-2 infection of multiple </article-title>'
        muts = me.process_article_lines([s], me.EXT_XML, verbose=True)
        self.assertEqual(muts, ['D614G'])

        s = 'D614G  223322A>T  42A&gt;G 23G > T'
        muts = me.process_article_lines([s], me.EXT_XML, verbose=True)
        self.assertEqual(muts, ['D614G', '223322A>T', '42A>G', '23G>T'])

    def test_merge_new_data_with_old(self):
        df_old = pd.DataFrame({me.COL_UID: [1, 2, 3], me.COL_MUTATIONS: [10, 20, 30]})
        df_new = pd.DataFrame({me.COL_UID: [2, 3, 4], me.COL_MUTATIONS: [21, 31, 41]})
        df = me.merge_new_data_with_old(df_new, df_old)
        # print(df)
        self.assertEqual(df.shape, (4, 2))
        self.assertEqual(df.iloc[0, 1], 10)   # First row's value should be original (10)
        self.assertEqual(df.iloc[1, 1], 21)   # Second row's value should be replaced from 20 to 21


if __name__ == '__main__':
    unittest.main()

import time
import unittest

import vcf_parser

TEST_VCF_FILE1 = 'test_data/total.vcf'


class TestVcfParser(unittest.TestCase):

    def test_load(self):
        vcf_obj = vcf_parser.VcfParser()
        vcf_obj.read_vcf_file(TEST_VCF_FILE1)
        self.assertEqual(vcf_obj.df_vcf.shape, (19756, 10))

        # Test get mutations
        muts = vcf_obj.get_mutations()
        print(muts.head())

        # Test write to file
        output_file = f'__out_mutations_{time.time()}.txt'
        vcf_obj.write_mutations_to_file(output_file)


if __name__ == '__main__':
    unittest.main()

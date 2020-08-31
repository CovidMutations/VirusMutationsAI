import time
import unittest

import vcf_parser

TEST_VCF_FILE1 = 'db/sample.vcf'
TEST_VCF_FILE2 = 'db/sample_snpeffect_top100.vcf'


class TestVcfParser(unittest.TestCase):

    def test_load(self):
        vcf_obj = vcf_parser.VcfParser()
        vcf_obj.read_vcf_file(TEST_VCF_FILE1)
        self.assertEqual(vcf_obj.df_vcf.shape, (19756, 10))

        # Test get mutations
        muts = vcf_obj.get_mutations()
        print(muts.head())

        # Test write to file
        output_file = f'__out_mutations1_{time.time()}.txt'
        vcf_obj.write_mutations_to_file(output_file)


    def test_load_with_snpeff_data(self):
        vcf_obj = vcf_parser.VcfParser()
        vcf_obj.read_vcf_file(TEST_VCF_FILE2)
        self.assertEqual(vcf_obj.df_vcf.shape, (88, 10))

        # Test get mutations
        muts = vcf_obj.get_mutations()
        print(muts.head())

        # Test write to file
        output_file = f'__out_mutations2_{time.time()}.txt'
        vcf_obj.write_mutations_to_file(output_file)


if __name__ == '__main__':
    unittest.main()
